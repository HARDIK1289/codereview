import os
import json
import re
import asyncio
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser
from dotenv import load_dotenv
import os

load_dotenv()

# --- 1. SETUP LLM CLIENT (Hybrid Strategy) ---
def get_llm(json_mode=False, use_fast_model=False):
    kwargs = {"temperature": 0.1}

    if json_mode:
        kwargs["model_kwargs"] = {"response_format": {"type": "json_object"}}

    model_name = "llama-3.1-8b-instant" if use_fast_model else "llama-3.3-70b-versatile"

    return ChatOpenAI(
        base_url="https://api.groq.com/openai/v1",
        api_key="dummy_key",  # 🔥 HARDCODED
        model=model_name,
        **kwargs
    )

# --- HELPER: Context Manager ---
def format_code_context(repo_files):
    context = ""
    MAX_TOTAL_CHARS = 9000
    MAX_FILE_CHARS = 3000   
    
    def get_priority(f):
        name = f['path'].lower()
        if name.endswith(('.py', '.js', '.ts', '.cpp', '.c', '.java')): return 0
        if name.endswith(('.json', '.yml', '.xml')): return 1
        return 2

    priority_files = sorted(repo_files, key=get_priority)
    current_chars = 0
    for file in priority_files:
        if current_chars >= MAX_TOTAL_CHARS: break
        header = f"\n--- {file['path']} ---\n"
        content = file['content']
        if len(content) > MAX_FILE_CHARS:
            content = content[:MAX_FILE_CHARS] + "\n...(truncated)"
        if current_chars + len(content) + len(header) > MAX_TOTAL_CHARS:
            remaining = MAX_TOTAL_CHARS - current_chars - len(header)
            if remaining > 100:
                context += header + content[:remaining] + "\n...(global limit)"
            break
        context += header + content
        current_chars += len(header) + len(content)
    return context

# --- AGENTS ---

async def analyze_semantics(repo_files):
    llm = get_llm(json_mode=True, use_fast_model=True)
    context = format_code_context(repo_files)
    prompt = ChatPromptTemplate.from_template("""
    Analyze this code. Return JSON only.
    JSON Schema: {{ "patterns": "str", "smells": "str", "anti_patterns": "str" }}
    CODE: {context}
    """)
    chain = prompt | llm | JsonOutputParser()
    try:
        return await chain.ainvoke({"context": context})
    except:
        return {"patterns": "N/A", "smells": "N/A", "anti_patterns": "N/A"}

async def calculate_scores(semantic_analysis, repo_files):
    # Use FAST model
    llm = get_llm(json_mode=True, use_fast_model=True)
    
    # ⚡ STRICT GRADING PROMPT
    prompt = ChatPromptTemplate.from_template("""
    Score the codebase as a Senior Code Reviewer. Be CRITICAL.
    
    SCORING RUBRIC (0-100):
    - 90-100: Exceptional (Production-ready, perfect docs, zero smells)
    - 70-89: Good (Solid logic, but minor readability/structure issues)
    - 50-69: Average (Works, but messy or hard to maintain)
    - 0-49: Poor (Spaghetti code, no comments, security risks)

    CRITICAL INSTRUCTION:
    - Do NOT be generous. 
    - Scores MUST be integers.
    
    JSON Schema:
    {{ "readability_score": "integer", "maintainability_score": "integer", "score_justifications": ["string"] }}
    
    ANALYSIS: {analysis}
    """)
    chain = prompt | llm | JsonOutputParser()
    try:
        return await chain.ainvoke({"analysis": str(semantic_analysis)})
    except:
        return {"readability_score": 0, "maintainability_score": 0, "score_justifications": ["Analysis failed"]}

async def rank_issues(repo_files):
    llm = get_llm(json_mode=True, use_fast_model=True)
    context = format_code_context(repo_files)
    prompt = ChatPromptTemplate.from_template("""
    Find the worst issue. Return a JSON object.
    JSON Schema:
    {{ "worst_issue": {{ "file": "str", "snippet": "str", "severity": "High", "explanation": "str" }} }}
    CODE: {context}
    """)
    chain = prompt | llm | JsonOutputParser()
    try:
        return await chain.ainvoke({"context": context})
    except:
        return {"worst_issue": {"file": "N/A", "snippet": "Analysis skipped", "severity": "Low", "explanation": "Processing error"}}

async def rewrite_code(worst_issue):
    llm = get_llm(json_mode=True, use_fast_model=True)
    prompt = ChatPromptTemplate.from_template("""
    Fix this code. Return a JSON object.
    JSON Schema: {{ "rewritten_code": "str", "rewrite_explanation": "str" }}
    ISSUE: {issue}
    """)
    chain = prompt | llm | JsonOutputParser()
    try:
        return await chain.ainvoke({"issue": str(worst_issue)})
    except:
        return {"rewritten_code": "# Fix unavailable", "rewrite_explanation": "Could not generate fix."}

async def generate_report(repo_files, scores, worst_issue):
    llm = get_llm(json_mode=False, use_fast_model=True)
    prompt = ChatPromptTemplate.from_template("""
    Write a mini Code Review (Markdown).
    SCORES: {scores}
    ISSUE: {worst_issue}
    """)
    chain = prompt | llm | StrOutputParser()
    try:
        return await chain.ainvoke({"scores": str(scores), "worst_issue": str(worst_issue)})
    except:
        return "Report unavailable."

async def analyze_repo_for_profile(repo_files, parsed_metrics):
    # ⚡ Use FAST model to avoid Timeouts
    llm = get_llm(json_mode=True, use_fast_model=True)
    context = format_code_context(repo_files)
    loc = sum(f['metrics']['loc'] for f in parsed_metrics)
    
    prompt = ChatPromptTemplate.from_template("""
    Analyze repo for Developer Profile. Be CRITICAL with scores.
    Scores MUST be 0-100 integers.
    
    JSON Schema:
    {{
      "readability_score": "integer", 
      "maintainability_score": "integer", 
      "justification": "text_summary",
      "worst_function": {{ "name": "str", "code": "str", "why": "str" }},
      "rewritten_function": {{ "code": "str", "explanation": "str" }}
    }}
    Stats: LOC={loc}. CODE: {context}
    """)
    chain = prompt | llm | JsonOutputParser()
    try:
        return await asyncio.wait_for(chain.ainvoke({"loc": loc, "context": context}), timeout=25)
    except Exception as e:
        print(f"Profile Agent Error: {e}")
        return {
            "readability_score": 50, "maintainability_score": 50,
            "justification": "Analysis timed out.",
            "worst_function": {"name": "N/A", "code": "", "why": ""},
            "rewritten_function": {"code": "", "explanation": ""}
        }

async def generate_developer_profile_summary(username, analyzed_repos):
    llm = get_llm(json_mode=True, use_fast_model=False)
    
    # ⚡ STRICT MATH BLOCK ⚡
    # We calculate the average manually so the AI cannot hallucinate a "better" score.
    total_r, total_m = 0, 0
    count_r, count_m = 0, 0
    
    for repo in analyzed_repos:
        ai = repo.get("ai_analysis", {})
        r = ai.get("readability_score", 0)
        m = ai.get("maintainability_score", 0)
        
        # Valid Score Filter: Must be > 0 (Success) and > 10 (Not the 1-10 bug)
        if r > 10: 
            total_r += r
            count_r += 1
        if m > 10:
            total_m += m
            count_m += 1
            
    # Calculate Integer Average
    avg_r = int(total_r / count_r) if count_r > 0 else 0
    avg_m = int(total_m / count_m) if count_m > 0 else 0

    print(f"   📊 Calculated Profile Average: Readability={avg_r}, Maintainability={avg_m}")

    summary_input = str(analyzed_repos)[:4000]
    
    prompt = ChatPromptTemplate.from_template("""
    Create a developer profile for '{username}'.
    
    CRITICAL INSTRUCTIONS:
    1. You MUST use exactly these calculated scores:
       - Overall Readability: {avg_r}
       - Overall Maintainability: {avg_m}
    2. Do NOT invent your own scores.
    3. Write the 'developer_overview' in Markdown.
    
    JSON Schema:
    {{
      "overall_readability": "integer",
      "overall_maintainability": "integer",
      "developer_overview": "markdown_text",
      "improvement_tips": [ {{ "title": "str", "description": "str", "priority": 1 }} ]
    }}
    
    Data: {data}
    """)
    chain = prompt | llm | JsonOutputParser()
    try:
        return await chain.ainvoke({
            "username": username, "data": summary_input,
            "avg_r": avg_r, "avg_m": avg_m
        })
    except:
        return {
            "overall_readability": avg_r, "overall_maintainability": avg_m, 
            "developer_overview": "Profile generation failed.", 
            "improvement_tips": []
        }