

# See all keywords:
import keyword
print("Reserved keywords:", keyword.kwlist)

# 1a. int — whole numbers, unlimited size
count = 25
negative = -100
big = 10_000_000           # underscore = visual separator, ignored by Python
print(count, negative, big, type(count))