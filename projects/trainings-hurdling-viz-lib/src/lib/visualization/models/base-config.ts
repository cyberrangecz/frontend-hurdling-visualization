import { PlanData } from './plan-data';
import { Padding } from './padding';

export class BaseConfig {
    data: PlanData;
    element: string;
    outerWrapperElement: string;
    time: number;
    padding: Padding;
    minBarHeight: number;
    maxBarHeight: number;
    estimatedTime: number;
}
