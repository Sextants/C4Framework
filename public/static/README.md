// 从固定位置./schema加载AJV校验文件，文件名为加载后的Key
// 优先加载./Config/C4Logger.yml/json（日志配置，启动日志系统，启动前，输出到控制台）
// 从输入参数获取AppName，Version，InstanceID，Profiles，Label（优先级最高）
// 从./Config目录加载配置加载器的配置(init configger)
// 调用配置开始加载回调
// 根据Config设置启用相应的macros，调用配置处理回调
// 从./Config目录和./Config/AppConfig加载其他配置，调用配置处理回调
// 检查是否存在./.tmp目录，存在检查是否存在.App.json，如果存在加载Application信息
// 优先使用输入参数
// 调用配置加载完毕回调
// 初始化Eureka客户端（根据配置），调用初始化回调
// 初始化回调中初始化WebServer，


// 远程配置必须先有AppInfo
// 本地配置可以用输入参数覆盖App.yml，如果有.App.json则InstanceID用这里的，否则自动生成并写入这个文件
// 


// 服务的status页面要提供自己支持的负载均衡种类和权重