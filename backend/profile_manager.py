import asyncio
from datetime import datetime, timedelta
from dateutil.parser import parse
import pytz

# Import helpers 
from github_helpers import fetch_repo_content
from parser_helpers import analyze_code_structure
from llm_agents import analyze_repo_for_profile

def sample_repositories(all_repos):
    """
    Selects up to 3 repositories. 
    Prioritizes repos that likely have data in the DB or are largest.
    """
    if not all_repos:
        return { "selected_repos": [], "rationale": "No repositories found." }

    # Strategy: Pick top 3 largest repos (likely the main projects)
    sorted_repos = sorted(all_repos, key=lambda x: x.get("size", 0), reverse=True)
    selected_repos = sorted_repos[:3]
    
    names = [r.get("name") for r in selected_repos]
    rationale = f"Selected top {len(selected_repos)} repositories: {', '.join(names)}"
    
    return { "selected_repos": selected_repos, "rationale": rationale }

async def check_analysis_cache(db, selected_repos, force_refresh=False):
    """
    SMART CACHE STRATEGY:
    1. Look for existing data in the DB.
    2. VALIDATE IT: If the score is < 10 (old 1-10 bug) or 0 (failure), DELETE IT.
    3. Only return cached data if it is high-quality (0-100 scale).
    """
    final_plan = []
    cached_count = 0
    new_count = 0
    
    for repo in selected_repos:
        repo_url = repo.get("html_url")
        repo_name = repo.get("name")
        
        if not repo_url: 
            print(f"   ⚠️ Skipping {repo_name} (No URL found)")
            continue

        cached = None
        
        # Search DB for ANY analysis matching the repo URL
        cached = await db.analysis_results.find_one(
            {"repo_url": repo_url},
            sort=[("created_at", -1)] 
        )
        
        # --- SMART VALIDATION STEP ---
        is_valid_cache = False
        
        if cached:
            ai_data = cached.get("ai_analysis", {})
            r_score = ai_data.get("readability_score", 0)
            
            # Check if this is "Good Data" (Score > 10 means it's on the 0-100 scale)
            if isinstance(r_score, (int, float)) and r_score > 10:
                is_valid_cache = True
            else:
                # If score is 0, 6, 4, etc. -> It's bad/old data. PURGE IT.
                print(f"   🗑️ Purging invalid/old cache for '{repo_name}' (Score: {r_score})")
                await db.analysis_results.delete_one({"_id": cached["_id"]})
        
        if is_valid_cache:
            print(f"   💎 Found VALID database record for '{repo_name}'")
            final_plan.append({ "repo": repo, "status": "cached", "data": cached })
            cached_count += 1
        else:
            print(f"   ⚡ No valid cache for '{repo_name}'. Queuing for analysis...")
            final_plan.append({ "repo": repo, "status": "needs_analysis", "data": None })
            new_count += 1
            
    return { "plan": final_plan, "stats": { "cached": cached_count, "new": new_count } }

async def analyze_profile_repos(plan, github_token, db):
    results = []
    
    for item in plan:
        repo = item["repo"]
        status = item["status"]
        repo_name = repo.get("name", "Unknown")
        repo_url = repo.get("html_url")
        
        if status == "cached":
            results.append(item["data"])
            continue
            
        print(f"   ⚡ Analyzing {repo_name} (Fast Mode)...")
        
        try:
            if not repo_url: continue

            files = fetch_repo_content(repo_url, github_token)
            if not files:
                print(f"      ❌ Skipping {repo_name} (Empty/Unreachable)")
                continue

            parsed = analyze_code_structure(files)
            ai_result = await analyze_repo_for_profile(files, parsed)
            
            analysis_doc = {
                "repo_url": repo_url,
                "repo_name": repo_name,
                "created_at": datetime.utcnow(),
                "static_metrics": parsed,
                "ai_analysis": ai_result
            }
            
            await db.analysis_results.insert_one(analysis_doc)
            results.append(analysis_doc)
            
        except Exception as e:
            print(f"      ❌ Analysis Failed for {repo_name}: {e}")
            continue
        
    return results