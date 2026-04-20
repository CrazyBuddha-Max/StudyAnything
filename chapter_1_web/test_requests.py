import requests

try:
    response = requests.get(url="https://www.baidu.com", timeout=5)

    response.raise_for_status()

    response.encoding = response.apparent_encoding

    with open("chapter_1/index.html", "w", encoding="utf-8") as f:
        f.write(response.text)

    print("内容已成功导出到 index.html")

except requests.exceptions.RequestException as e:
    print(f"发生错误: {e}")
