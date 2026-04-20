import pandas as pd
from tavily import TavilyClient
import requests
import openai


tavily = TavilyClient(api_key="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")
client = openai.OpenAI(api_key="sk-ece2fc260245421994110309cb0b6aea", base_url="https://api.deepseek.com")

def get_news_intelligence():
    
    df_country = pd.read_csv('国家.csv')
    df_brand = pd.read_csv('关键词.csv')


    for country in df_country['国家']:
        for brand in df_brand['关键词']:

            query = f"{brand} automobile news in {country} (policy OR MSRP OR launch OR tech)"


            search_res = tavily.search(query=query, search_depth="advanced", max_results=5)
            
            for result in search_res['results']:
                url = result['url']
                
                
                jina_url = f"https://r.jina.ai/{url}"
                content = requests.get(jina_url).text
                
                
                response = client.chat.completions.create(
                    model="deepseek-chat",
                    messages=[
                        {"role": "system", "content": "你是一个情报专家。请对照[新闻类型准则]判定此内容是否符合要求。要求如下：1.政策法规 2.竞品扩张..."},
                        {"role": "user", "content": f"新闻正文：{content[:4000]}"} # 截取前4k字防溢出
                    ]
                )
                
                
                print(f"处理完成: {brand} - {country}")

if __name__ == "__main__":
    get_news_intelligence()