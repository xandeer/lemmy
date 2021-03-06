import { UserOperation, Comment, User } from './interfaces';
import * as markdown_it from 'markdown-it';

export let repoUrl = 'https://github.com/dessalines/lemmy';

export function msgOp(msg: any): UserOperation {
  let opStr: string = msg.op;
  return UserOperation[opStr];
}

var md = new markdown_it({
  html: true,
  linkify: true,
  typographer: true
});

export function hotRank(comment: Comment): number {
  // Rank = ScaleFactor * sign(Score) * log(1 + abs(Score)) / (Time + 2)^Gravity

  let date: Date = new Date(comment.published + 'Z'); // Add Z to convert from UTC date
  let now: Date = new Date();
  let hoursElapsed: number = (now.getTime() - date.getTime()) / 36e5;

  let rank = (10000 *  Math.log10(Math.max(1, 3 + comment.score))) / Math.pow(hoursElapsed + 2, 1.8);

  // console.log(`Comment: ${comment.content}\nRank: ${rank}\nScore: ${comment.score}\nHours: ${hoursElapsed}`);

  return rank;
}

export function mdToHtml(text: string) {
  return {__html: md.render(text)};
}

export function getUnixTime(text: string): number { 
  return text ? new Date(text).getTime()/1000 : undefined;
}

export function addTypeInfo<T>(arr: Array<T>, name: string): Array<{type_: string, data: T}> {  
  return arr.map(e => {return {type_: name, data: e}});
}

export function canMod(user: User, modIds: Array<number>, creator_id: number): boolean {
  // You can do moderator actions only on the mods added after you.
  if (user) {
    let yourIndex = modIds.findIndex(id => id == user.id);
    if (yourIndex == -1) {
      return false;
    } else { 
      modIds = modIds.slice(0, yourIndex+1); // +1 cause you cant mod yourself
      return !modIds.includes(creator_id);
    }
  } else {
    return false;
  }
}

export function isMod(modIds: Array<number>, creator_id: number): boolean {
  return modIds.includes(creator_id);
}

export let fetchLimit: number = 20;
