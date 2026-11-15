

a = input("Ingresa el número a: ")
b = input("Ingresa el número b: ")
c = input("Ingresa el número c: ")

print("Originales:", a, b, c)

if a > b:
    a, b = b, a
if b > c:
    b, c = c, b
if a > b:
    a, b = b, a

print("Ordenados:", a, b, c)