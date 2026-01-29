import subprocess
import tempfile
import os

class CodeExecutor:
    @staticmethod
    def run(lang, code):
        ext = '.py'
        if lang == 'c': ext = '.c'
        elif lang == 'cpp': ext = '.cpp'
        
        with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as f:
            f.write(code.encode())
            temp_name = f.name

        try:
            if lang == 'python':
                res = subprocess.run(['python', temp_name], capture_output=True, text=True, timeout=5)
                return res.stdout if res.returncode == 0 else res.stderr

            elif lang in ['c', 'cpp']:
                executable = temp_name.replace(ext, '.exe')
                compiler = 'gcc' if lang == 'c' else 'g++'
                
                # Compile step
                compile_res = subprocess.run([compiler, temp_name, '-o', executable], capture_output=True, text=True)
                if compile_res.returncode != 0:
                    return f"COMPILATION ERROR:\n{compile_res.stderr}"
                
                # Run step
                run_res = subprocess.run([executable], capture_output=True, text=True, timeout=5)
                if os.path.exists(executable): os.remove(executable)
                return run_res.stdout if run_res.returncode == 0 else run_res.stderr

        except Exception as e:
            return f"SYSTEM ERROR: {str(e)}"
        finally:
            if os.path.exists(temp_name): os.remove(temp_name)