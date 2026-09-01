export type ChallengeItem={id:string;amount:number;completed:boolean;completedAt?:string};
export type Goal={id:string;name:string;targetAmount:number;monthlyAmount:number;createdAt:string;targetDate?:string;emoji:string;image?:string;challenge:ChallengeItem[]};
export type Transaction={id:string;goalId:string;amount:number;type:'challenge'|'manual';createdAt:string;challengeId?:string};
export type AppData={goals:Goal[];transactions:Transaction[]};
