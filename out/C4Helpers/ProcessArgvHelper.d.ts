import C4Framework from '../C4Framework';
/**
 * 处理命令行输入
 * 支持的标准的输入参数有：
 * -Version=d.d.xxx
 * -InstanceID=xxxx
 * -Profiles=dev/prod/test
 * -Desc=xxxx
 * -ConfigLabel=xxxx
 * -Labels=xxx,ooo
 * -Host=xxxxx
 * -Port=1111
 * --Debug
 * 自定义输入参数格式：
 * key=value
 * @param c4 C4Framework
 */
export default function ProcessArgvHelper(c4: C4Framework): Promise<boolean>;
