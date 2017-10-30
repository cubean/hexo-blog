---
title: Design Patterns in Scala (Part II)
date: 2017-10-29 22:49:24
categories: Scala
tags: 
- Scala
- Design Patten
---

# Singleton

## Normal way

```scala
object Greet {
 def hello(name: String): String = {
   "Hello %s".format(name)
 }
}
```

<!-- more -->

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