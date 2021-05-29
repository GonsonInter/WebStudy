"use strict";
// console.log('你好TS');
//
// var str: string = '你好TS';
//
// let num: any = '你好TS';
//
// let arr:number[] = [1, 2, 3.1, 12.3]
//
// let arr2:Array<number> = []
//
// let t:[string, number, boolean] = ['ts', 3.14, false];
//
// enum Flag {
//     success = 1,
//     error = -1
// }
// let f:Flag = Flag.error;
// console.log(f);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
// function sum(...result:number[]):number {
//     let sum = 0;
//     for (let i = 0; i < result.length; i ++) {
//         sum += result[i];
//     }
//     return sum;
// }
//
// console.log(sum(1, 2, 3, 4, 5, 6));
//
// setTimeout(() => {
//     console.log();
// })
// class Person{
//     name:string;	// 前面省略了public关键字
//     constructor(name:string) {		// 构造函数  实例化类的时候触发方法
//         this.name = name;
//     }
//     getName():string {
//         return this.name;
//     }
//     setName(name:string):void {
//         this.name = name;
//     }
//     run():void {
//         console.log(this.name);
//     }
// }
// let p = new Person('张三');
// console.log(p.getName());
//
//
// class Web extends Person {
//     constructor(name:string) {
//         super(name);
//     }
//     work() {
//         console.log(`${this.name}在运动`);
//     }
// }
//
// let w = new Web('李四');
// console.log(w.run());
// // 属性接口，对传入的对象进行约束
// interface FullName {
//     firstName:string;   // 分号结束
//     secondName:string;
// }
// function printName(name:FullName):void {
//     // 必须传入对象  firstName  secondName
//     console.log(name.firstName + '---' + name.secondName);
// }
// interface LabelledValue {
//     label: string;
// }
//
// function printLabel(labelledObj: LabelledValue) {
//     console.log(labelledObj.label);
// }
//
// let myObj = {size: 10, label: "Size 10 Object"};
// printLabel(myObj);
//
// console.log(myObj);
// function getData<T>(value:T):T {
//     return value;
// }
//
// getData<number>(123)
// class MinClass {
//     public list:number[] = [];
//     add(num:number):void {
//         this.list.push(num);
//     }
//     min():number {
//         return this.list.reduce((last, item) => {
//             return Math.min(last, item);
//         }, Number.MAX_VALUE);
//     }
// }
// interface DBI<T> {
//     add(info:T):boolean;
//     update(info:T, id:number):boolean;
//     delete(id:number):boolean;
//     get(id:number):any[];
// }
//
// // 定义一个操作mysql数据库的类
// class MysqlDb<T> implements DBI<T> {
//     add(info: T): boolean {
//         return false;
//     }
//
//     delete(id: number): boolean {
//         return false;
//     }
//
//     get(id: number): any[] {
//         return [];
//     }
//
//     update(info: T, id: number): boolean {
//         return false;
//     }
// }
//
// // 定义一个操作mssql数据库的类
// class MsSql<T> implements DBI<T> {
//     add(info: T): boolean {
//         return false;
//     }
//
//     delete(id: number): boolean {
//         return false;
//     }
//
//     get(id: number): any[] {
//         return [];
//     }
//
//     update(info: T, id: number): boolean {
//         return false;
//     }
// }
//
// // 操作用户表  定义一个User类和数据库表做映射
// class User {
//     username:string | undefined;
//     password:string | undefined;
// }
//
// let u = new User();
// u.username = '张三';
// u.password = '123456';
//
// let oMysql = new MysqlDb<User>();   // 类作为参数来约束传入的数据类型
// oMysql.add(u);
// // 类装饰器
// function logClass(params:any) {
//     console.log(params);
//     // params就是当前类
//     params.prototype.apiUrl = '动态拓展的属性';
//     params.prototype.run = function() {
//         console.log('我是一个run方法');
//     }
// }
//
// @logClass
// class HttpClient {
//     constructor() {
//
//     }
//
//     getData() {
//
//     }
// }
//
// let http = new HttpClient();
// console.log(http.apiUrl);
// http.run();
// function logProp(params:any) {
//     return function(target:any, attr:any) {
//         console.log(target)  // { constructor:f, getData:f }
//         console.log(attr)  // url
//         target[attr] = params;  //通过原型对象修改属性值 = 装饰器传入的参数
//         target.api = 'xxxxx';  //扩展属性
//         target.run = function() {  //扩展方法
//             console.log('run...');
//         }
//     }
// }
// class HttpClient {
//     @logProp('http://baidu.com')
//     public url:any|undefined;
//     constructor() { }
//     getData() {
//         console.log(this.url);
//     }
// }
// var http:any = new HttpClient();
// http.getData();  // http://baidu.com
// console.log(http.api);  // xxxxx
// http.run();  // run...
// // 方法装饰器
// function logMethod(params:any) {
//     return function(target:any, method:any, desc:any) {
//         console.log(target);
//         console.log(method);
//         console.log(desc);
//         /* 修改被装饰的方法 */
//         //1. 保存原方法体
//         let oldMethod = desc.value;
//         //2. 重新定义方法体
//         desc.value = function(...args:any[]) {
//             //3. 把传入的数组元素都转为字符串
//             let newArgs = args.map((item)=>{
//                 return String(item);
//             });
//             //4. 执行原来的方法体
//             console.log('this--------:' , this);
//             oldMethod.apply(this, newArgs);
//         }
//     }
// }
//
// class HttpClient {
//     constructor() { }
//     @logMethod('http://baidu.com')
//     getData(...args:any[]) {
//         console.log('getData: ', args);
//     }
// }
//
// let h = new HttpClient();
// h.getData(3, 'awdwa');
// 方法参数装饰器
function logMethod(params) {
    return function (target, paramName, paramIndex) {
        console.log(params);
        console.log(target);
        console.log(paramName);
        console.log(paramIndex);
    };
}
var HttpClient = /** @class */ (function () {
    function HttpClient() {
    }
    HttpClient.prototype.getData = function (uid) {
    };
    __decorate([
        __param(0, logMethod('uuid'))
    ], HttpClient.prototype, "getData", null);
    return HttpClient;
}());
var h = new HttpClient();
h.getData(123456);
