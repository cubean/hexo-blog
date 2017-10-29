---
title: Amazing map and flatMap in Scala
date: 2017-09-25 09:10:24
tags:
---

The map and flatMap function are the amazing feature of Scala language, which also sometime make scala learner confused.

<!-- more -->

Next is the list of all kinds of situations which map and flatMap working in:

## Collection

### General way

```scala
val l = List(1,2,3,4,5)
l.map(_ * 2)

// Output
List[Int] = List(2, 4, 6, 8, 10)

```

### Parallel computing

> scala 2.11.x

Input 

```scala
val l = List(1,2,3,4,5).par

// Using all left cpu cores exception OS thread
val cpuCores = Runtime.getRuntime.availableProcessors()
val forkNum = if(cpuCores > 2) cpuCores - 1 else 1
l.tasksupport = new scala.collection.parallel.ForkJoinTaskSupport(new scala.concurrent.forkjoin.ForkJoinPool(forkNum))

l.map(_ * 2)
```

Output

```
l: scala.collection.parallel.immutable.ParSeq[Int] = ParVector(1, 2, 3, 4, 5)
cpuCores: Int = 4
forkNum: Int = 3
l.tasksupport: scala.collection.parallel.TaskSupport = scala.collection.parallel.ForkJoinTaskSupport@73f2ec4c
res1: scala.collection.parallel.immutable.ParSeq[Int] = ParVector(2, 4, 6, 8, 10)
```

> scala 2.12.x: type ForkJoinPool in package forkjoin is deprecated (since 2.12.0): use java.util.concurrent.ForkJoinPool directly. 
> 
> But now, par option doesn't work with map function in scala 2.12.x version.

Input

```scala
val l = List(1,2,3,4,5).par

// Using all left cpu cores exception OS thread
val cpuCores = Runtime.getRuntime.availableProcessors()
val forkNum = if(cpuCores > 2) cpuCores - 1 else 1
l.tasksupport = new scala.collection.parallel.ForkJoinTaskSupport(new java.util.concurrent.ForkJoinPool(forkNum))

l.map(_ * 2)
```

No output up to now (24/09/2017 tested in scala 2.12.2)


### Tips: Changing scala shell version number

> Using current installed version

```sh
$ scala
Welcome to Scala 2.12.2 (Java HotSpot(TM) 64-Bit Server VM, Java 1.8.0_141).
```
> Using old version

```sh
$ vi ~/.sbt/0.13/build.sbt
scalaVersion := "2.11.11"

$ sbt console
Welcome to Scala 2.11.11 (Java HotSpot(TM) 64-Bit Server VM, Java 1.8.0_141).
```

## Option

> Map

```scala
def f(x: Int) = if(x > 2) Some(x) else None

val r = 1 to 5
r.map(f)

```

Output

```sh
res3: scala.collection.immutable.IndexedSeq[Option[Int]] = Vector(None, None, Some(3), Some(4), Some(5))
```

> flatMap

```scala
def f(x: Int) = if(x > 2) Some(x) else None

val r = 1 to 5
r.flatMap(f)

```

Output

```sh
res5: scala.collection.immutable.IndexedSeq[Int] = Vector(3, 4, 5)
```


## Future

```scala
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

def ff(x: Int) = Future { if(x > 2) Some(x) else None }
def ff2(x: Int) = Future { if(x > 2) Future {Some(x)} else Future { None } }

ff(3).map(println)
ff2(4).flatMap(_.map(println))

println("End")

```

Output

```sh
End
Some(3)
Some(4)
...
ff: (x: Int)scala.concurrent.Future[Option[Int]]
ff2: (x: Int)scala.concurrent.Future[scala.concurrent.Future[Option[Int]]]
```

## Future & Option

```scala
def foa: Future[Option[String]] = Future(Some("a"))
def fob(a: String): Future[Option[String]] = Future(Some(a+"b"))
```

Using a Scalaz monad transformer

```scala
import scalaz._
import Scalaz._
import scalaz.OptionT._

// We are importing a scalaz.Monad[scala.concurrent.Future] implicit transformer

val composedAB3: Future[Option[String]] = (for {
  a <- optionT(foa)
  ab <- optionT(fob(a))
}yield ab).run
```

## Map

```scala
val m = Map(1 -> 10, 2 -> 20, 3 -> 30)
m.mapValues(_ / 10)
// res6: scala.collection.immutable.Map[Int,Int] = Map(1 -> 1, 2 -> 2, 3 -> 3)

def f(x: Int) = if(x > 20) Some(x) else None
m.mapValues(f)
// res8: scala.collection.immutable.Map[Int,Option[Int]] = Map(1 -> None, 2 -> None, 3 -> Some(30))

m.mapValues(f).map(_._2).flatten
// res12: scala.collection.immutable.Iterable[Int] = List(30)

m.mapValues(f).filter(_._2 != None)
// res14: scala.collection.immutable.Map[Int,Option[Int]] = Map(3 -> Some(30))

m.filter(_._2 > 20)
res16: scala.collection.immutable.Map[Int,Int] = Map(3 -> 30)

m.filter { case (k, v) => f(v).isDefined }
res21: scala.collection.immutable.Map[Int,Int] = Map(3 -> 30)
```

## map vs for

```scala
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

def f1(x: Int) = Future { x * 10 }
def f2(x: Int) = Future { x / 10 }

// f2(f1(9))

```

> map

```scala
f1(3).map{ f2(_).map(println)}
// res23: scala.concurrent.Future[scala.concurrent.Future[Unit]] = Future(<not completed>)
// 3

f1(3).flatMap{ f2(_)}.map(println)
// res22: scala.concurrent.Future[Unit] = Future(<not completed>)
// 3

```

> for

```scala
val rel = for { 
					v1 <- f1(3)
					v2 <- f2(v1)
				 } yield v2
rel.map(println)

// 3

```
