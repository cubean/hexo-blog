---
title: Design Patterns in Scala (Part I)
date: 2017-10-14 19:50:32
categories: Scala
tags: 
- Scala
- Design Patten
---


## The Kungfu in scala programming

Definition in GOF (the Gang of Four)

> Descriptions of communicating objects and classes that are customized to
solve a general design problem in a particular context.


## Design pattern space

### Creational Purpose

Class Scope

- Factory Method [Cubean Blog](http://www.cubeanliu.com/2017/10/14/DesignPatternsInScala/)

Object Scope

- Abstract Factory   [Wiki](https://en.wikipedia.org/wiki/Abstract_factory_pattern) [Cubean Blog](http://www.cubeanliu.com/2017/10/14/DesignPatternsInScala/)
- Builder
- Prototype
- Singleton [Wiki](https://en.wikipedia.org/wiki/Singleton_pattern) [Cubean Blog](http://www.cubeanliu.com/2017/10/29/Design-Patterns-in-Scala-Part-II/)


### Structural Purpose

Class Scope

- Adapter(class) 

Object Scope

- Adapter(object)
- Bridge
- Composite
- Decorator
- Facade
- Flyweight
- Proxy

### Behavioral Purpose

Class Scope

- Interpreter
- Template Method 

Object Scope

- Chain of Responsibility
- Command
- Iterator
- Mediator
- Memento
- Observer
- State
- Strategy
- Visitor

<!-- more -->

## Language Features and Patterns

A typical singleton implementation in Java language:

```java
public class ClassicSingleton {
	private static ClassicSingleton instance = null ;
	
	private ClassicSingleton() {
		// Exists only to defeat instantiation .
	}
	
	public static ClassicSingleton getInstance() {
		if ( instance == null ) {
			instance = new ClassicSingleton() ;
		}
		
		return instance ;
	}
}
```

A typical singleton implementation in Scala language:

```scala
object ClassicSingleton {
}
```

## Factory Method

Description

> Define an interface for creating an object, but let subclasses decide which class to instantiate. Factory Method lets a class defer instantiation to sub- classes.

![alt text](http://best-practice-software-engineering.ifs.tuwien.ac.at/patterns/images/FactoryMethod.jpg)

```scala
trait Product {

    def getPrice : Float
    
    def setPrice(price : Float)

    def getProductType : String = {
        "Unknown Product"
    }
}

case class Milk(private var price : Float) extends Product {

    def getPrice : Float = price
    
    def setPrice(price : Float) = this.price = price
    
    override def getProductType : String = "Milk"
}

case class Sugar(private var price : Float) extends Product {

    def getPrice : Float = price
    
    def setPrice(price : Float) = this.price = price
    
    override def getProductType : String = "Sugar"
}

object ProductFactory {

   def createProduct(kind : String): Product = {

		kind match {
        case "Sugar" => Sugar(1.49F)
        case "Milk" => Milk(0.99F)
        
        // If the requested Product is not available, 
        //   we produce Milk for a special price.
        case _ => Milk(0.79F)
       }
    }
}

class Shopper {
	def main(args: Array[String]): Unit = {
		// We create a shopping-cart
		val cart : Set[Product] = Set(
			ProductFactory.createProduct("Milk"),
			ProductFactory.createProduct("Sugar"),
			ProductFactory.createProduct("Bread")
		)
		
		println(cart)
	}
}
```

Output:

```sh
Set(Milk(0.99), Sugar(1.49), Milk(0.79))
```


## Abstract Factory

Description 
> Provide an interface for creating families of related or dependent objects without specifying the concrete classes.

Focus on **Encapsulation**

![alt text](https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Abstract_factory_UML.svg/677px-Abstract_factory_UML.svg.png)

Sometimes, A factory defined both products and process and hide all details but just output object with general format.

```scala
object AnimalFactory {	private trait Animal	private case class Dog(name : String = "doggy") extends Animal	private case class Cat(name : String = "cat") extends Animal
	
	private def createDog = Dog().name 
	private def createCat = Cat().name
	
	def createAnimal(kind : String) : String = {
		kind match {
        case "dog" => createDog
        case "cat" => createCat
        case _ => throw new IllegalArgumentException()
       }
    }
}
```

Client

```sh
MyAnimalFactory.createAnimal("dog")

res20: String = doggy
```

> Sometimes, a factory just defined and hide process then output object defined in outside.

```scala
trait Animalcase class Dog(name : String) extends Animalcase class Cat(name : String) extends Animal
	
object MyAnimalFactory {	private def createDog = Dog("doggy") 
	private def createCat = Cat("cat")
	
	def createAnimal(kind : String) : Animal = {
		kind match {
        case "dog" => createDog
        case "cat" => createCat
        case _ => throw new IllegalArgumentException()
       }
    }
}

```

Client

```scalaMyAnimalFactory.createAnimal("dog")
res14: Animal = Dog(doggy)```















