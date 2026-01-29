from rest_framework.decorators import api_view
from rest_framework.response import Response
from .executor import CodeExecutor

@api_view(['POST'])
def run_compiler(request):
    code = request.data.get('code', '')
    lang = request.data.get('lang', 'python')
    if not code:
        return Response({'output': 'No code provided.'})
    
    # This calls your executor.py logic
    result = CodeExecutor.run(lang, code)
    return Response({'output': result or "Executed successfully."})