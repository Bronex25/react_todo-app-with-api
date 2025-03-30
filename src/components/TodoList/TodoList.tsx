import React from 'react';
import { TodoItem } from '../TodoItem';
import { PartialTodo, Todo } from '../../types/Todo';

type Props = {
  todos: Todo[];
  editingTodoId: number | null;
  changingTodoId: number[];
  toggleTodoStatus: ({ id, completed }: PartialTodo) => Promise<void>;
  onSubmitTodoEdit: (title: string, id: number, newTitle: string) => void;
  onDelete: (id: number) => void;
  onEsc: (event: React.KeyboardEvent) => void;
  setEditingTodoId: (id: number) => void;
};

export const TodoList: React.FC<Props> = ({
  todos,
  editingTodoId,
  toggleTodoStatus,
  onSubmitTodoEdit,
  changingTodoId,
  onDelete,
  onEsc,
  setEditingTodoId,
}) => {
  return (
    <section
      className="todoapp__main"
      data-cy="TodoList"
      hidden={todos.length === 0}
    >
      {todos.map(todo => (
        <TodoItem
          todo={todo}
          editingTodoId={editingTodoId}
          toggleTodoStatus={toggleTodoStatus}
          onSubmitTodoEdit={onSubmitTodoEdit}
          changingTodoId={changingTodoId}
          onDelete={onDelete}
          onEsc={onEsc}
          setEditingTodoId={setEditingTodoId}
          key={todo.id}
        />
      ))}
    </section>
  );
};
