class LLMClient():
    """
        use different llm api to get answer
    """
    def __init__(self,url,modelname,apikey):
        self.url = url
        self.modelname = modelname
        self.apikey = apikey


    def fetch_answer(self, prompt: str):
        print(f"正在请求 [{self.modelname}]...")
        print(f"URL: {self.url} | Key: {self.apikey}")
        return f"来自 {self.modelname} 的回答"


if __name__ == '__main__':
    deepseek = LLMClient(modelname= "deepseek", url="http://127.0.0.1:8000", apikey="123456")
    openai = LLMClient(modelname= "openai", url="http://127.0.0.1:8001", apikey="654321")

    print(deepseek.fetch_answer("你好"))
    print(openai.fetch_answer("你好"))
