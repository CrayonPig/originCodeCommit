/* @flow */

export function runQueue(queue: Array<?NavigationGuard>, fn: Function, cb: Function) {
  // 定义一个递归函数 step，它接收一个 index 参数来指示当前执行的守卫索引
  const step = index => {
    // 如果 index 超出队列长度，说明所有守卫已执行完毕，调用回调函数 cb
    if (index >= queue.length) {
      cb();
    } else {
      // 如果 queue[index] 存在（即守卫存在）
      if (queue[index]) {
        // 调用传入的 fn 函数，并传递当前守卫（queue[index]）和一个回调函数
        // 这个回调函数作为参数传递给守卫函数，表示守卫函数执行完毕后的下一步操作
        fn(queue[index], () => {
          // 递归调用 step，继续执行下一个守卫
          step(index + 1);
        });
      } else {
        // 如果 queue[index] 不存在，直接执行下一个守卫
        step(index + 1);
      }
    }
  };

  // 从队列的第一个守卫开始执行
  step(0);
}

