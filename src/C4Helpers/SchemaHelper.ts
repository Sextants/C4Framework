import C4AJV        from 'c4ajv';
import C4Framework  from '../C4Framework';

import Path         = require('path');

const SchemaDir     = './schema';

/**
 * 加载AJV的JSON Schema文件
 * 从SchemaDir目录中扫描所有文件加载
 * @param c4 C4Framework
 */
export default async function SchemaHelper(c4 : C4Framework) {
    if (c4.getChecker() === null) {
        let SchemaPath  = Path.join(process.cwd(), SchemaDir);
        let AJV = new C4AJV();
        await AJV.init(SchemaPath);
        c4.setChecker(AJV);
    }

    return true;
}
