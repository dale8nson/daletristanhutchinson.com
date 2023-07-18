const repeat = (n, s) => `${Array(n).fill(s).join(' ')}`;
const log = (strings, ...values) => strings.map((str, index) => `${str}${values[index] || ''}`).join('');

const DEBUG = true;

const _alt = ([str]) => {
  const alts = str.split(/\s*?,\s*?/g);
  DEBUG && console.log(`alts: ${alts}`);
  const replacer = (...args) => args[1]?.toUpperCase();
  const compiledString = alts?.map(al => {
    DEBUG && console.log(`al: ${al}`);
    const exprs = al.split(/\s*?\/\s*?/g);
    DEBUG && console.log(`exprs: ${exprs}`);
    const idTokenMap = exprs.map(exp => {
      const tokens = exp.split(/\s*?:\s*?/g);
      let identifier;
      if(tokens[0].startsWith('!')) identifier = tokens[0];
      else identifier = tokens[0].replace(/-(.)/g, replacer);
      DEBUG && console.log(`identifier: ${identifier}`);
      return [identifier, ...tokens];
    });
    DEBUG && console.log(`idTokenMap: ${idTokenMap}`);
    const firstAvailableIdMap = idTokenMap.find((idTokens, index) => {
      DEBUG && console.log(`%ctypeof idTokens[0]: ${typeof idTokens[0]}`,`color:orange;`)
      try {
        DEBUG && console.log(`%cidTokens ${index}: ${idTokens}`,`color:#ee0000ff;`);
        if (idTokens[0].startsWith('!')) {
          DEBUG && console.log(`%cidToken ${idTokens[0]} (index: ${index}) exists.`,`color:yellow;`);
          return true;
        }
        const result = eval(idTokens[0]);
        console.log(eval(idTokens[0]));
        DEBUG && console.log(`%c(0,eval)(idTokens[0]): ${result}`, `color:orange;`);
        if((0,eval)(idTokens[0])) {
          DEBUG && console.log(`%cidToken ${idTokens[0]} (index: ${index}) exists.`,`color:yellow;`);
          return true;
        }
      } 
      catch {
        DEBUG && console.log(`%cidToken ${idTokens[0]} (index: ${index}) does %cNOT %cexist.`,`color:yellow;`, `color:#ee0000ff`,`color:yellow;`);

        return false;
      }
    });
    if(firstAvailableIdMap) {
      DEBUG && console.log(`firstAvailableIdMap: ${firstAvailableIdMap}`);
      DEBUG && console.log(`Array(Number(firstAvailableIdMap[2]) || 1).length: ${Array(Number(firstAvailableIdMap[2]) || 1).length}`);
      DEBUG && console.log(`Array(Number(firstAvailableIdMap[2]) || 1).fill(firstAvailableIdMap[0].startsWith('!') ? firstAvailableIdMap[1].replace('!','') : firstAvailableIdMap[1]).join(' ')): ${Array(Number(firstAvailableIdMap[2]) || 1).fill(firstAvailableIdMap[0].startsWith('!') ? firstAvailableIdMap[1].replace('!','') : firstAvailableIdMap[1]).join(' ')}`);
      return Array(Number(firstAvailableIdMap[2]) || 1).fill(firstAvailableIdMap[0].startsWith('!') ? firstAvailableIdMap[1].replace('!','') : firstAvailableIdMap[1]).join(' ');
    }
    return null;
  }).join(' ');
  DEBUG && console.log(`compiledString: ${compiledString}`);
  return compiledString;
}

const alt =  _alt;

export {
  repeat,
  log,
  alt
};