export function enqueue(task) {
  const queue = Promise.resolve().then(task, task);
  return queue;
}
