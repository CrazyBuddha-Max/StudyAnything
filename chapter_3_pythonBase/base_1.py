def is_valid_identifier(name: str):
    try:
        exec(f"{name} = None")
        return True
    except SyntaxError:
        return False


print(is_valid_identifier("vasw"))
print(is_valid_identifier("1vasw"))
