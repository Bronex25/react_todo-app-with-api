import { PartialTodo, Todo } from '../types/Todo';
import { client } from '../utils/fetchClient';

export const USER_ID = 2156;

export const getTodos = () => {
  return client.get<Todo[]>(`/todos?userId=${USER_ID}`);
};

export const addTodo = ({ userId, title, completed }: Omit<Todo, 'id'>) => {
  return client.post<Todo>('/todos', { userId, title, completed });
};

export const deleteTodo = (id: number) => {
  return client.delete(`/todos/${id}`);
};

export const updateTodo = ({ id, ...todoData }: PartialTodo) => {
  return client.patch<Todo>(`/todos/${id}`, todoData);
};
