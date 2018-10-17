import { Controller } from 'c4webservice'
import { ServiceStatus } from '../C4FrameworkTypes/C4ApplicationInfo';
import C4Framework from '..';

@Controller.RestController()
export default class StatusController {
    
    @Controller.RequestMapping({
        Path : "/Status",
        Method : "GET",
        Produces : "application/json"
    })
    static Status() {
        return {
            code : 600,
            msg  : 'Succeed',
            data : ServiceStatus || {
                Status : "Unknown",
                LoadBalance : C4Framework.getConfig().LoadBalance       // 提供自身的负载均衡提示
            }
        }
    }
}
