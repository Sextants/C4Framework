import C4Framework from '../C4Framework';
/**
 * 初始化Configger
 * 根据配置从本地或远程源加载配置
 * 加载完毕后配置存储在C4Configger的静态成员变量g_Config中
 * @param c4 C4Framework
 */
export default function ConfiggerHelper(c4: C4Framework): Promise<boolean>;
