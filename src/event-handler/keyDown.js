let callBacks = [];

export default {
  onKeyDown: (event: Object) => {
    callBacks.forEach((callBack) => {
      callBack(event);
    });
  },

  registerCallBack: (callBack): void => {
    const callBackIndex = callBacks.findIndex(cb => cb == callBack);
    if(callBackIndex == -1){
      callBacks.push(callBack);
    }
  },

  deregisterCallBack: (callBack): void => {
    callBacks = callBacks.filter(cb => cb !== callBack);
  },
};
