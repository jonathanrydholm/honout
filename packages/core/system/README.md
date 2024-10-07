# Honout System

## Motivation

I have been working as an IT consultant for a decade with a lot of clients and applications.
Although the applications may be using the same packages and techniques, they are built and structured in completely different ways.

@honout creates an opinionated red-line to follow when it comes to the structure of an application, but not how you write your business logic.
It is heavily using dependency injection down to a very granular level, opening up the possibility of rebinding and extending deeply nested logic. It is also automatically making applications testable, since all dependencies are injected.

## Structure

A @honout system is made up of applications, each application is made up of functionalities and functionalities are constructed by logic.

-   System
    -   Application_A
        -   Functionality
            -   Logic_1
            -   Logic_2
    -   Application_B
        -   Functionality
            -   Logic

### System

Create a new system

```ts
import { System} from '@honout/system'

new System().start().then(...)
```

The system manages applications. Applications may be added in the following way:

```ts
new System().registerApplication(MyApp).start();
```

### Application

Applications are created by implementing a special interface from `@honout/system` and marking them as injectable

```ts
import { IApplication, injectable } from '@honout/system';

@injectable()
class MyApp implements IApplication {}
```

You can specify the startup sequence of applications by giving them a priority. This is useful if you want to start applications in a sequence. The higher of a priority an application has, the earlier it will start with respect to the other application priorities. If no priority is given, the default 0.

```ts
@injectable()
@WithStartupPriority(0)
class MyApp implements IApplication {}
```

You can also give your application an identifier which will help for debugging

```ts
@injectable()
@WithIdentifier('MyApplication')
class MyApp implements IApplication {}
```

To make your application actually do something, you want to add [functionality](../functionality/README.md) to it.
