---
title: Scala Example (Part II) - Language points and Transformation
date: 2017-08-03 23:28:06
categories: Scala
tags:
- Scala
- Example
---

The examples about lazy val, Implicit and so on.


<!-- more -->


## Language points

### Lazy Val

#### Example

```scala
def expr: Int = {
    val x = {
      print("x")
      1
    }

    lazy val y = {
      print("y")
      2
    }

    def z = {
      print("z")
      3
    }

    z + y + x + z + y + x
  }
  
  expr
```

#### Output

```sh
xzyz
res0: Int =12
```

#### Explain

- **val** body will be called once in the definition process. Then will never be called again.
- **lazy val** body will be called once while really used. Then will never be called again.
- **def** body is only called while used everytime but not in the definition process.

### Implicit

#### Example

```scala
  implicit class Crossable[X](xs: Traversable[X]) {
    def cross[Y](ys: Traversable[Y]): Traversable[(X, Y)] = for {x <- xs; y <- ys} yield (x, y)
  }

  implicit class StringHandler(str: String) {
    def myPrint(): Unit = println(">>> " + str)
  }

  val xs = Seq(1, 2)
  val ys = List("hello", "world", "bye")

  def getResult: Traversable[(Int, String)] = {
    println(this.getClass.getName)
    xs cross ys
  }

  def tryImplicitFunc(str: String): Unit = str.myPrint()
```
#### Output

```sh
scala> getResult
res4: Traversable[(Int, String)] = List((1,hello), (1,world), (1,bye), (2,hello), (2,world), (2,bye))

scala> tryImplicitFunc("!!!")
>>> !!!
```
#### Explain

**Implicit** could be used to extend an existing class even it's in an external library.


### intern()

```scala
val tags = if (arr.length >= 6) Some(arr(5).intern()) else None)
```

#### Document

```java
java.lang.String
@org.jetbrains.annotations.NotNull 
public String intern()
Returns a canonical representation for the string object.
A pool of strings, initially empty, is maintained privately by the class String.
When the intern method is invoked, if the pool already contains a string equal to this String object as determined by the equals(Object) method, then the string from the pool is returned. Otherwise, this String object is added to the pool and a reference to this String object is returned.
It follows that for any two strings s and t, s.intern() == t.intern() is true if and only if s.equals(t) is true.
All literal strings and string-valued constant expressions are interned. String literals are defined in section 3.10.5 of the The Java™ Language Specification.
Returns:
a string that has the same contents as this string, but is guaranteed to be from a pool of unique strings.
```

## Transformation

### groupBy

```scala
val ages = List(2,52,44,23,17,14,12,82,51,64)

val grouped = ages.groupBy { age =>
      if(age >= 18 && age < 65) "adult"
      else if(age < 18) "child"
      else "senior"
      }
      
//grouped: scala.collection.immutable.Map[String,List[Int]] = Map(senior -> List(82), adult -> List(52, 44, 23, 51, 64), child -> List(2, 17, 14, 12))

```
