import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";
const { persistAtom } = recoilPersist();

export interface ITodo {
  id: number;
  todo: string;
}

export interface IBoard {
  id: number;
  title: string;
  toDos: ITodo[];
}

export const toDoState = atom<IBoard[]>({
  key: "toDo",
  default: [
    {
      id: 0,
      title: "Drag and Drop",
      toDos: [{ id: 0, todo: "Task1" }],
    },
  ],
  effects_UNSTABLE: [persistAtom],
});

