lst = [2, 3, 5, 5, 6, 3, 8, 3, 9, 8, 1, 2, 3, 2, 4, 5, 3, 2]

# 去重加上重排序（按从小到大）
new_lst1 = list(set(lst))
print(new_lst1)

# 去重并保持原本顺序
new_lst2 = list(dict.fromkeys(lst))
print(new_lst2)

# 去重加上重排序（按从大到小）
new_lst3 = sorted(list(set(lst)), reverse=True)
print(new_lst3)
