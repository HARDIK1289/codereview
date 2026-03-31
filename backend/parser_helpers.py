from tree_sitter import Language, Parser
import tree_sitter_python
import tree_sitter_javascript
# Ensure you ran: pip install tree-sitter-cpp
try:
    import tree_sitter_cpp
    CPP_AVAILABLE = True
except ImportError:
    CPP_AVAILABLE = False
    print("⚠️ Warning: tree-sitter-cpp not installed. C++ analysis will be limited.")

PY_LANGUAGE = Language(tree_sitter_python.language())
JS_LANGUAGE = Language(tree_sitter_javascript.language())
if CPP_AVAILABLE:
    CPP_LANGUAGE = Language(tree_sitter_cpp.language())

def get_parser(lang_ext):
    parser = Parser()
    if lang_ext in ['py', 'python']:
        parser.language = PY_LANGUAGE
        return parser
    elif lang_ext in ['js', 'jsx', 'javascript', 'ts', 'tsx', 'mjs', 'cjs']:
        parser.language = JS_LANGUAGE
        return parser
    elif CPP_AVAILABLE and lang_ext in ['c', 'cpp', 'cc', 'cxx', 'h', 'hpp']:
        parser.language = CPP_LANGUAGE
        return parser
    return None

def analyze_code_structure(files_data):
    parsed_results = []
    
    for file in files_data:
        parser = get_parser(file["language"])
        
        # Fallback if no parser (e.g. JSON/MD files)
        if not parser:
            parsed_results.append({
                "file": file["path"],
                "metrics": {
                    "loc": len(file["content"].splitlines()),
                    "cyclomatic_complexity_proxy": 1,
                    "avg_function_length": 0,
                    "function_count": 0
                },
                "functions": []
            })
            continue

        try:
            tree = parser.parse(bytes(file["content"], "utf8"))
            root_node = tree.root_node
            
            functions = []
            total_complexity = 0
            
            # Simple heuristic traversal
            def traverse(node):
                nonlocal total_complexity
                if node.type in ['function_definition', 'class_definition', 'arrow_function', 'method_definition']:
                    name_node = node.child_by_field_name('name')
                    if name_node:
                        name = file["content"][name_node.start_byte:name_node.end_byte]
                        functions.append(name)
                
                # Complexity counts (branches)
                if node.type in ['if_statement', 'for_statement', 'while_statement', 'case_statement', 'catch_clause']:
                    total_complexity += 1
                    
                for child in node.children:
                    traverse(child)
                    
            traverse(root_node)
            
            parsed_results.append({
                "file": file["path"],
                "metrics": {
                    "loc": file["content"].count('\n') + 1,
                    "cyclomatic_complexity_proxy": total_complexity,
                    "avg_function_length": 0, # Simplified
                    "function_count": len(functions)
                },
                "functions": functions
            })
        except Exception as e:
            print(f"Error parsing {file['path']}: {e}")
            
    return parsed_results