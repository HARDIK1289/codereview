import os
import requests
import base64

def get_user_repos(username, token):
    headers = {"Authorization": f"token {token}"}
    url = f"https://api.github.com/users/{username}/repos?sort=updated&per_page=100"
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    return []

def fetch_repo_content(repo_url, token):
    """
    Recursively fetches file content from a GitHub repo.
    """
    # Extract owner and repo name
    parts = repo_url.rstrip("/").split("/")
    owner, repo_name = parts[-2], parts[-1]
    
    api_url = f"https://api.github.com/repos/{owner}/{repo_name}/git/trees/main?recursive=1"
    headers = {"Authorization": f"token {token}"}
    
    # Try 'main' branch first, then 'master'
    response = requests.get(api_url, headers=headers)
    if response.status_code == 404:
        api_url = f"https://api.github.com/repos/{owner}/{repo_name}/git/trees/master?recursive=1"
        response = requests.get(api_url, headers=headers)
        
    if response.status_code != 200:
        print(f"❌ Failed to fetch tree for {repo_name}: {response.status_code}")
        return []

    tree = response.json().get("tree", [])
    files_data = []
    
    # ⚡ UPDATE: Added C/C++ and Config extensions
    ALLOWED_EXTENSIONS = {
        '.py', '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', 
        '.java', '.cpp', '.cc', '.cxx', '.c', '.h', '.hpp', 
        '.css', '.html', '.json', '.md', '.yml', '.yaml'
    }

    # Limit total files to prevent freezing
    count = 0
    MAX_FILES = 15

    for item in tree:
        if item["type"] == "blob" and count < MAX_FILES:
            ext = os.path.splitext(item["path"])[1].lower()
            if ext in ALLOWED_EXTENSIONS:
                # Skip massive files (likely locks or minified code)
                if item.get("size", 0) > 150000: continue
                
                file_url = item["url"]
                file_resp = requests.get(file_url, headers=headers)
                if file_resp.status_code == 200:
                    content = base64.b64decode(file_resp.json()["content"]).decode("utf-8", errors="ignore")
                    files_data.append({
                        "path": item["path"],
                        "content": content,
                        "language": ext.replace(".", "")
                    })
                    count += 1
    
    return files_data