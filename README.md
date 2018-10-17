<h1>C4Feamework使用手册</h1>

<h2>简介</h2>

C4Framework是基于TypeScript构建的，用于快速实现应用服务的开发框架。其设计思想是将固定的不变的代码由框架提供，使用者只提供与业务逻辑相关的变化部分的代码，从而减少编码工作量，降低出错概率，提升开发质量。

同时框架提供一定的工具和规范，减少开发人员的沟通成本。

项目的代码在内部GitLab中[C4FrameworkTS](http://10.0.0.82:9999/SoftwareDepartment/C4FrameworkTS)

[Git仓库](http://10.0.0.82:9999/SoftwareDepartment/C4FrameworkTS.git)

<h2>构成</h2>

C4Framework按照模块的方式进行构建，除了部分基础的模块以外（@types、C4Schema、C4Utils）其他模块都可以独立运行和使用。

C4Framework由以下部分构成：

* @types
* C4Schema
* C4AccessControl
* C4AJV
* C4APIsClient
* C4Configger
* C4EurekaClient
* C4JWT
* C4LoadBalancer
* C4Logger
* C4MQ
* C4ORM
* C4RESTFulClient
* C4ROM
* C4Utils
* C4WebService
* C4SwaggerJSCodeGenerator
* C4Framework

<h4>@types</h4>

由于部分npm包没有对应d.ts描述文件，@types下为自行补充的部分包的d.ts文件，其中包含：

* body-parser-xml
* clone-deep
* eureka-jc-client
* hashring
* mixin-deep
* node-rest-client
* redis-cookie-store
* winston-redis

<h4>C4Schema</h4>

用于存放JSON Schema的配置文件，用于关键部分配置文件和结构的校验，其中包含：

* ApplicationInfo.json      [ApplicationInfo的校验配置]
* ConfiggerConfig.json      [Configger的配置的校验配置]
* LoggerConfig.json         [Logger的配置的校验配置]
* Profiles.json             [Configger Server的类型校验配置]

<h4>C4Utils</h4>

一些工具方法的汇总，主要包括：

* FSPromise，对FS一些方法的Promise封装，以及ForeachFiles和getModules的实现方法；
* PathUtils，对Path的一些方法的Promise封装；
* TypeUtils，对象类型检测，以及objectTrav和configObj2JSObj的实现方法。

<h4>C4AJV</h4>

JSON Schema校验的实现，基于AJV库的封装

<h4>C4Logger</h4>

日志库，基于winston库的封装，支持功能：

* 提供日志的多目的输出，即同一日志信息可以同时输出到文件、控制台和ELK（redis）;
* 支持日志的颜色显示；
* 支持对象输出和profile的帮助方法；
* 支持运行时修改当前的日志级别；
* 默认支持fatal、err、warn、info、debug、trace六个日志级别，对应red、red、yellow、green、blue、magenta的颜色（在./src/C4LogLevels.ts中进行配置）。

<h4>C4Configger</h4>

配置文件加载器，支持功能：

* 本地配置文件支持yaml和json格式，其中json格式支持注释；
* 本地配置文件支持宏定义和文件引用（@link://{filePath}）;
* 远程配置文件支持Spring Cloud的Configer Server；
* 远程配置文件支持宏定义但不支持文件引用；
* 支持将远程配置文件展开为标准JSON对象，如：
  <code>
  
        {
            name : 'sdfsdfsdf/app01-dev.yml',
            source : {
                xxx[0].Path : '123',
                xxx[1].main : 'sadsd',
                oooo.host : 'sdfdsf'
            }
        }
  
  </code>
  解析为：

  <code>
  
      {
          name : 'sdfsdfsdf/app01-dev.yml',
          source: {
              xxx : [
                  {
                      Path : '123'
                  },
                  {
                      main : 'asdsd'
                  }
              ],
              ooo : {
                  host : 'sdfdsf'
              }
          }
      }
  
  </code>

* 支持将加载完毕的配置Dump为一个完整的配置文件输出。

<h4>C4MQ</h4>

C4MQ是基于amqp模块构建的MQ操作类（模块），并提供了更高级的封装形式，支持功能：

* 提供Publisher和Subscriber定义，建立在Exchange和Queue的基础上；
* 提供注解方式定义消息处理方法；
* 支持Subscriber与Publisher之间的自由绑定；
* Subscriber支持对预读取的消息进行排队处理，确保处理方法的FIFO执行。

<h4>C4ORM</h4>

C4ORM是对sequelize库的简单封装，主要对数据类型进行了自定义声明。

<h4>C4ROM</h4>

该模块暂时未实现，后继可以设计为基于Redis的Cache的注解模块。

<h4>C4RESTFulClient</h4>

C4RESTFulClient是基于request的封装：

* 支持Http、Http协议；
* 支持Cookie；
* response的stream处理；
* 支持对Content-Type和Content-Disposition进行Parser的定义，并在接收response时自动选定；
* 支持GET、POST、PUT、PATCH、DELETE这些METHOD。

<注意：C4RESTFulClient_new为目前维护的Project，C4RESTFulClient已经不再维护>。

<h4>C4EurekaClient</h4>

C4EurekaClient是对eureka-js-client库的封装，支持将NodeJS的服务注册到Spring Cloud的Eureka服务。

<h3>WebService相关</h3>

<h4>C4JWT</h4>

C4JWT是对JSON Web Token的实现，支持：

* 对payload部分进行加密；
* 对token撤销

<h4>C4AccessControl</h4>

C4AccessControl是基于RBAC（基于角色权限控制）模型进行设计的权限控制框架（模块），需要配置C4WebService模块进行使用（已内置ACL解析和控制逻辑）。

<h4>C4WebService</h4>

C4WebService是基于Express进行二次封装的WebService类，支持：

* http和https协议；
* 集成ACL（C4AccessControl）;
* 集成JWT（C4JWT）；
* 支持Cookie；
* 支持Session；
* 支持CORS（跨域支持）；
* 支持raw、urlencoded、text、json、xml格式Body；
* 支持静态路径；
* 支持gzip压缩；

<h3>RESTFul API相关</h3>

<h4>C4APIsClient</h4>

C4APIsClient提供依赖服务对象和C4APIsClient接口定义，用于通过Swagger文档自动生成API调用代码。

<h4>C4SwaggerJSCodeGenerator</h4>

C4SwaggerJSCodeGenerator是通过解析Swagger(2.0)文档来自动生成API调用代码的代码生成器。

<h4>C4Framework</h4>

C4Framework本体，提供基于配置的功能集成、初始化过程及全局变量支持。

<h2>配置文件</h2>

<h3>C4Helpers.yml</h3>

用来配置控制Helper的功能和加载顺序。

目前支持的Helper有：

  # 基础配置初始化部分
  - "ProcessArgvHelper"               # 处理启动参数
  - "SchemaHelper"                    # 加载JSON Schema
  - "LoggerHelper"                    # 初始化Logger
  - "AppInfoHelper"                   # 加载App Info
  - "ConfiggerHelper"                 # 加载配置
  - "DumpAppInfoHelper"               # Dump App Info
  # 根据具体的使用功能进行初始化
  - "RESTClientHelper"                # 初始化RESTFul Client
  - "ORMHelper"                       # 初始化ORM
  - "ROMHelper"                       # 初始化Redis及ROM
  - "MQHelper"                        # 初始化MQ
  - "RegistryHelper"                  # 向发现与注册中心注册自己
  - "DependenciesHelper"              # 等待依赖的服务上线（后面还要等待所有服务Ready）
  - "WebServiceHelper"                # 初始化自己的WebService
  - "WaitDependenciesHelper"          # 等待所有依赖的服务Ready
  - "DelaySubscribeHelper"            # 延迟订阅的订阅者

<h3>App.yml</h3>

各部分模块的配置和自定义的配置。
各部分配置具体参考配置文件注释和对应模块的配置文件注释。

<h2>初始化过程</h2>

根据C4Helpers.yml中配置的Helper和顺序进行自动初始化。

<h2>自定义初始化过程</h2>

构造C4Framework时可以选择设置自定义的初始化过程，在执行init时，首先执行自动化初始化过程，在自动化出事化过程执行完毕后屌用自定义初始化过程。

<h2>启动过程</h2>

调用launch完成启动，在构造C4Framework时可以选择定义的启动过程，若设置在启动过程中调用自定义launch过程。

<h2>注意事项</h2>

C4Framework提供一个done方法，在自定义launch过程中或在其他异步启动事件完成后可以调用来更改服务当前的状态。
