import C4Framework from '../C4Framework';
/**
 * 加载AppInfo
 * 会与从命令行参数加载的AppInfo信息进行合并
 * 优先使用命令行参数中的配置
 * @param c4 C4Framework
 */
export default function AppInfoHelper(c4: C4Framework): Promise<boolean>;
