import { Component, computed, effect, signal } from '@angular/core';
import { FilterType, TodoModel } from '../../models/todo';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css',
})
export class TodoComponent {
  todolist = signal<TodoModel[]>([
    {
      id: 1,
      title: 'buy milk',
      completed: false,
      editing: false,
    },
    {
      id: 2,
      title: 'buy bread',
      completed: false,
      editing: false,
    },
    {
      id: 3,
      title: 'cheese',
      completed: false,
      editing: false,
    },
  ]);
  filter = signal<FilterType>('all');

  newTodo = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)],
  });
  todoListFilter = computed(() => {
    const filter = this.filter();
    const todos = this.todolist();
    switch (filter) {
      case 'active':
        return todos.filter((todo) => !todo.completed);
      case 'completed':
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  });

  constructor() {
    effect(() => {
      localStorage.setItem('todos', JSON.stringify(this.todolist()));
    });
  }

  ngOnInit(): void {
    const storage = localStorage.getItem('todos');
    if (storage) {
      this.todolist.set(JSON.parse(storage));
    }
  }

  changeFilter(filterString: FilterType) {
    this.filter.set(filterString);
  }
  addTodo() {
    const newTodoTitle = this.newTodo.value.trim();
    if (newTodoTitle !== '' && this.newTodo.valid) {
      this.todolist.update((prev_todos) => {
        return [
          ...prev_todos,
          { id: Date.now(), title: newTodoTitle, completed: false },
        ];
      });
      this.newTodo.reset();
    } else {
      this.newTodo.reset();
    }
  }
  toggleTodo(checkid: number) {
    this.todolist.update((prev_values) =>
      prev_values.map((todo) => {
        return todo.id === checkid
          ? { ...todo, completed: !todo.completed }
          : todo;
      }),
    );
  }
  removeTodo(id: number) {
    return this.todolist.update((prev_todo) =>
      prev_todo.filter((todo) => todo.id !== id),
    );
  }
  editingTodo(editId: number) {
    this.todolist.update((prev_todos) =>
      prev_todos.map((todo) => {
        return todo.id === editId ? { ...todo, editing: true } : todo;
      }),
    );
  }
  editingComplete(editingCompleteId: number, event: Event) {
    const titleInput = (event.target as HTMLInputElement).value;
    this.todolist.update((prev_todos) =>
      prev_todos.map((todo) => {
        return todo.id === editingCompleteId
          ? {
              ...todo,
              title: titleInput.trim(),
              editing: false,
              completed: false,
            }
          : todo;
      }),
    );
    // this.editTodo.reset();
  }
}
