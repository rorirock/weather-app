export class weather{
    codeCity!:String
    temperature!:number
    name!: string
    number!: number
    isDaytime!:boolean
    icon!:string
    shortForecast!: string
    relativeHumidity!:{
        unitCode:string
        value: number
    };
}