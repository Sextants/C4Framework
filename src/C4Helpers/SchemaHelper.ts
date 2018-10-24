import C4AJV        from 'c4ajv';
import C4Framework  from '../C4Framework';

import Path         = require('path');
import { FSP } from 'c4utils/out';

const SchemaDirs     = ['./schema', './Schema'];

/**
 * 加载AJV的JSON Schema文件
 * 从SchemaDir目录中扫描所有文件加载
 * @param c4 C4Framework
 */
export default async function SchemaHelper(c4 : C4Framework) {
    if (c4.getChecker() === null) {
        let SchemaPath = "";
        for (let i = 0; i < SchemaDirs.length; i++) {
          SchemaPath  = Path.join(process.cwd(), SchemaDirs[i]);
          let stat = await FSP.Stat(SchemaPath).catch((err) => { return null; });
          if (null === stat) { continue; }
          if (stat.isDirectory()) { break; }
        }

        if ("" === SchemaPath) {
          throw new Error(`SchemaHelper no such ${SchemaDirs.join(' or ')} directories.`);
        }
        
        let AJV = new C4AJV();
        await AJV.init(SchemaPath);
        c4.setChecker(AJV);
    }

    return true;
}
