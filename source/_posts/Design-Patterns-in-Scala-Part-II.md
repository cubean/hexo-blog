---
title: Design Patterns in Scala (Part II)
date: 2017-10-29 22:49:24
categories: Scala
tags: 
- Scala
- Design Patten
---

# Singleton

> In software engineering, the singleton pattern is a design pattern that restricts the instantiation of a class to one object. This is useful when exactly one object is needed to coordinate actions across the system. - Wikipedia

<!-- more -->

## Normal way

```scala
object Greet {
 def hello(name: String): String = {
   "Hello %s".format(name)
 }
}
```

### Singleton and Factory method

- Improvable Code

```scala
private def getRunner(analysis: String): (Analytics, DataFrame) => (Seq[JSONObject]) = analysis match {
    case ListAllAnalytics.instance.generalTrend => GeneralTrend.runModule
    case ListAllAnalytics.instance.generalWhy => GeneralWhy.runModule
    case ListAllAnalytics.instance.fittedTrend => FittedTrend.runModule
    case ListAllAnalytics.instance.fittedTrendIndexation => FittedTrendIndexation.runModule
    case ListAllAnalytics.instance.generalRanking => GeneralRanking.runModule
    case ListAllAnalytics.instance.generalMix | ListAllAnalytics.instance.twoFactorMix => GeneralMix.runModule
    case ListAllAnalytics.instance.mixIndexation | ListAllAnalytics.instance.twoWayMixPercentageIndexation => MixIndexation.runModule
    case ListAllAnalytics.instance.dayOfWeek => DayOfWeek.runModule
    case ListAllAnalytics.instance.dowIndexation => DayOfWeekIndex.runModule
    case ListAllAnalytics.instance.dowDeconstruction => DayOfWeekDeconstruction.runModule
    case ListAllAnalytics.instance.monthOfYear => MonthOfYear.runModule
    case ListAllAnalytics.instance.generalMovement => GeneralMovement.runModule
    case ListAllAnalytics.instance.movementIndexation => MovementIndex.runModule
    case ListAllAnalytics.instance.generalLinear => GeneralLinear.runModule
    case ListAllAnalytics.instance.linearRegression => LinearRegression.runModule
    case ListAllAnalytics.instance.seasonalityIndexation => SeasonalityIndexation.runModule
    case ListAllAnalytics.instance.seasonalityDeconstruction => SeasonalityDeconstruction.runModule
    case ListAllAnalytics.instance.importance => Importance.runModule
    case anythingElse => throw AnnaException(s"Found unknown analysis type $anythingElse")
  }
```

- Improved Code

Please refer to the Factory Method in Part I.

## Not all objects are Singleton

- Improvable Code

```scala
class Greet(name: String) {

  def apply(name: String): String = {
   "Hello %s".format(name)
 }
}

object Greet {
  def apply(name: String) = new Greet(name)
}
```

- Improved Code

```scala
object Greet {
 def apply(name: String): String = {
   "Hello %s".format(name)
 }
}

// Or I can call Greet like it is a function:
Greet("bob")
// => "Hello bob"
```

## Combined with implicit

```scala
import spray.json._

case class StatusResult(status: String, result: JsValue)

object StatusResult {
  implicit class StatusResultParser(jsonStr: String) {

    import StatusResultProtocol._

    def deserializeStatusResult: StatusResult = {

      // parse json string
      val json = jsonStr.parseJson

      json.convertTo[StatusResult]
    }
  }
}

object StatusResultProtocol extends DefaultJsonProtocol {
  implicit val StatusResultFormat: RootJsonFormat[StatusResult] = jsonFormat2(StatusResult.apply)
}

```

# Builder

> The intent of the Builder design pattern is to separate the construction of a complex object from its representation. - Wikipedia

Scala can do this more elegantly than can Java, but the general idea is the same.

```scala
class CarBuilder private() {
  private var car = Car(2, true, true, false)
  def setSeats(seats: Int) = { car = car.copy(seats = seats); this}
  def setSportsCar(isSportsCar: Boolean) = { car = car.copy(isSportsCar = isSportsCar); this}
  def result() = car
}
object CarBuilder {
  def apply() = new CarBuilder
}
```

Output:

```scala
scala> CarBuilder().setSeats(5).result
res21: Car = Car(5,true,true,false)
```


Normally, Scala lets you name arguments while passing them in, the builder pattern is no need.

```scala
case class Car(
	seats: Int, 
	isSportsCar: Boolean = false, 
	hasTripComputer: Boolean = false, 
	hasGPS : Boolean)

val car = Car(
  seats = 2, 
  isSportsCar = true, 
  hasTripComputer = true, 
  hasGPS = false
  // no need to pass in arguments with default values
)
```

The default values in a class definition are used for business purpose but not for testing. Please seperate test case with builder mode.

```scala
case class CarBuilder(
	seats: Int = 5, 
	isSportsCar: Boolean = false, 
	hasTripComputer: Boolean = false, 
	hasGPS : Boolean = false, 

	// All have test default values
	) {
	
	def apply() = Car(
		seats, 
		isSportsCar, 
		hasTripComputer, 
		hasGPS
		)
}
```
Output:

```scala
scala> CarBuilder(hasGPS = true)
res22: Car = Car(5,false,false,true)
```


# Prototype

> Cloning an object by reducing the cost of creation.

## Where to use & benefits

- When there are many subclasses that differ only in the kind of objects,
- A system needs independent of how its objects are created, composed, and represented.
- Dynamic binding or loading a method.
- Use one instance to finish job just by changing its state or parameters.
- Add and remove objects at runtime.
- Specify new objects by changing its structure.
- Configure an application with classes dynamically.
- Related patterns include
  - Abstract Factory, which is often used together with prototype. An abstract factory may store some prototypes for cloning and returning objects.
  - Composite, which is often used with prototypes to make a part-whole relationship.
  - Decorator, which is used to add additional functionality to the prototype.

> Dynamic loading is a typical object-oriented feature and prototype example. For example, overriding method is a kind of prototype pattern.

```scala
trait Shape {
   def draw
} 
class Line extends Shape {
   def draw = println("line")
}
class Square extends Shape {
   def draw = println("Square")
}
class Circle extends Shape {
   def draw = println("Circle")
}
```

> Overloading method is a kind of prototype too.

```scala
class Painting {
   def draw(p : Point, p2 : Point) = {
       //draw a line
   }
   def draw(p : Point, x : Int, y : Int) = {
       //draw a square
   }
   def draw(p : Point, x : Int) = {
       //draw a circle
   }
}
```

> Type parameterization in Scala

```scala
case class Vector3[T: Numeric](val x: T, val y: T, val z: T) {
  override def toString = s"($x, $y, $z)"

  def add(that: Vector3[T]) = Vector3(
    plus(x, that.x),
    plus(y, that.y),
    plus(z, that.z)
  )
  
  def add1(that: Vector3[T]) = new Vector3(x + that.x, y + that.y, z + that.z)

  private def plus(x: T, y: T) = implicitly[Numeric[T]] plus (x, y)
}
```
Output:

```sh
scala> Vector3(1,2,3) add Vector3(4,5,6)                                  
res1: Vector3[Int] = (5, 7, 9)

scala> Vector3(1.1, 2.2, 3.3) add Vector3(4.4, 5.5, 6.6)                      
res2: Vector3[Double] = (5.5, 7.7, 9.899999999999999)
```

The Numeric[T] trait provides operations on numeric types,

```scala
trait Numeric[T] extends Ordering[T] {
  def plus(x: T, y: T): T
  def minus(x: T, y: T): T
  def times(x: T, y: T): T
  def negate(x: T): T
  // other operations omitted
}
```