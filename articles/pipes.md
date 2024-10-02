# Pipe

Angular `pipe` нужен для преобразования данных прямо в HTML-шаблоне. Например, отображение даты и времени в желаемом формате или задание формата вывода числового значения.

В Angular имеется ряд встроенных `pipes`, но также предусмотрена возможность создания собственных.

Рассмотрим пример использования встроенного `DatePipe`.

```ts
@Component({
  selector: "date-pipe-example",
  template: `
    <p>
      {{ exampleDate | date : "dd.MM.yyyy" }}
    </p>
  `,
})
export class DatePipeExampleComponent {
  exampleDate = new Date(2000, 12, 12);
}
```

Как видно из примера, наименование Angular `pipe` указывается после символа `|`, следующим за значением, которое необходимо преобразовать.

Некоторые Angular `pipes`, такие как `date`, принимают параметры, передаваемые после имени фильтра и разделяемые символом `:`. В данном примере передается формат отображения даты. Подробно со всеми аргументами date можно ознакомиться в [официальной документации](https://angular.io/api/common/DatePipe).

Ниже приведен список некоторых наиболее часто используемых встроенных Angular `pipe`:

- `date` — преобразование даты;
- `number` — преобразование числа;
- `uppercase` (`lowercase`) — приведение строкового значения в верхний (нижний) регистр;
- `slice` — используется для ограничения вывода информации, в качестве параметров принимает начало и конец интервала отображаемых данных, применяется совместно с директивой \*ngFor.

Полный список встроенных Angular `pipes` можно найти в [документации](https://angular.io/api/common#pipes).

К одному значению допустимо одновременное применение нескольких `pipes`.

```ts
{{someString | pipe1 | pipe2 | pipe3 | ... }}
```

Встроенные `pipes` подходят в основном для решения "базовых" задач. Поэтому часто требуется создавать собственные.

## Создание своих pipes

Если нам потребуется некоторая предобработка при выводе данных, мы можем для этой цели написать свои собственные `pipes`. К примеру, нам надо из массива строк будет создавать строку, принимая начальный и конечный индексы для выборки данных из массива. Добавим `pipe`, который будет принимать параметры. Для этого добавим в проект новый файл `join.pipe.ts`, в котором определим следующее содержимое:

```ts
import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "join",
})
export class JoinPipe implements PipeTransform {
  transform<T>(array: T[], start?: number, end?: number): string {
    let result: T[] = array;

    if (start !== undefined) {
      if (end === undefined) {
        result = array.slice(start);
      } else {
        result = array.slice(start, end);
      }
    }

    return result.join(", ");
  }
}
```

К кастомному pipe должен применяться декоратор Pipe. Этот декоратор определяет метаданные, в частности, название pipe, по которому он будет использоваться:

```ts
@Pipe({
    name: 'join'
})
```

Также класс реализует метод `transform()` интерфейса `PipeTransform`. Этот метод в качестве параметра принимает значение, к которому применяется `pipe`, а также опциональный набор параметров. А на выходе возвращается отформатированное значение.

В метод `transform()` класса `JoinPipe` первым параметром передается массив, второй необязательный параметр `start` представляет начальный индекс, с которого производится выборка, а третий параметр `end` — конечный индекс.

С помощью метода `slice()` получаем нужную часть массива, а с помощью метода `join()` соединяем массив в строку.

Применим `JoinPipe`:

```ts
import { Component } from "@angular/core";

@Component({
  selector: "app-phones-list",
  template: `
    <div>{{ phones | join }}</div>
    <div>{{ phones | join : 1 }}</div>
    <div>{{ phones | join : 1 : 3 }}</div>
  `,
})
export class AppPhonesListComponent {
  phones = ["iPhone 7", "LG G 5", "Honor 9", "Idol S4", "Nexus 6P"];
}
```

Но чтобы задействовать `JoinPipe`, его надо добавить в модуле

```ts
@NgModule({
  declarations: [AppPhonesListComponent, JoinPipe],
})
export class AppPhonesModule {}
```

![Результат работы JoinPipe](/public/9_1-join-pipe.png)

## Pure и Impure Pipes

Pipes бывают двух типов: `pure` (чистые) и `impure` (грязные). Различие между этими двумя типами заключается в реагировании на изменение значений, которые передаются в `pipe`.

> Стоит упомянуть, что сами `pipes` не отслеживают изменения. `Impure pipes` запускаются на каждый `change detection`, а `pure pipes` запускаются только если значение примитива или ссылки изменилось.

По умолчанию все `pipes` представляют тип `pure`. Такие объекты реагируют на изменения значений примитивных типов (`String, Number, Boolean, Symbol`). В других объектах — ссылочных типов (`Date, Array, Function, Object`) реакция на изменения происходит, когда меняется ссылка, а не значение.
То есть, если в массив добавили элемент, массив поменялся, но ссылка переменной, которая представляет данный массив, не изменилась. Поэтому на подобное изменение `pure pipes` не будут реагировать.

`Impure pipes` реагируют на любые изменения. Возможно, возникает вопрос, зачем тогда нужны `pure pipes`? Дело в том, что реагирования на любые изменения сказываются на производительности, и поэтому `pure pipes` могут показывать лучшую производительность. К тому же не всегда необходимо реагировать на изменения в сложных объектах, иногда это совершенно не нужно.

Теперь посмотрим на примере с ранее созданным `JoinPipe`. Этот `pipe` производит операции над массивом. Соответственно если в компоненте динамически добавлять новые элементы в массив, к которому применяется `JoinPipe`, то мы не увидим изменений. Так как `JoinPipe` не будет отслеживать изменения над массивом.

Теперь сделаем его `impure`. Для этого добавим в декоратор `Pipe` параметр `pure: false`

```ts
@Pipe({
  name: "join",
  pure: false,
})
export class JoinPipe implements PipeTransform {
  // ...
}
```

Теперь мы можем добавлять в компоненте новые элементы в этот массив

```ts
@Component({
  selector: "app-phones-list",
  template: `
    <input [(ngModel)]="phoneValue" />
    <button (click)="add()">Add</button>

    <p>{{ phones | join }}</p>
  `,
})
export class AppPhonesListComponent {
  value = "";

  readonly phones = ["iPhone 7", "LG G 5", "Honor 9", "Idol S4", "Nexus 6P"];

  add() {
    this.phones.push(this.value);
  }
}
```

И ко всем добавленным элементам также будет применяться `JoinPipe`, потому что после события `click` будет запускаться новый `change detection`, а `impure pipes` вызываются на каждый цикл изменений.

![Результат работы impure JoinPipe](/public/9_2-join-pipe.png)

Когда добавляется новый элемент, класс `JoinPipe` заново начинает обрабатывать массив. Поэтому `pipe` применяется ко всем элементам.

## AsyncPipe

```ts
Одним из встроенных классов, который в отличие от других `pipes` уже по умолчанию представляет тип `impure`. `AsyncPipe` позволяет получить результат асинхронной операции.
```

`AsyncPipe` отслеживает объекты `Observable` и `Promise` и возвращает полученное из этих объектов значение. При получении значения `AsyncPipe` сигнализирует компоненту о том, что надо проверить изменения. Если компонент уничтожается, то `AsyncPipe` автоматически отписывается от объектов `Observable` и `Promise`, что предотвращает возможные утечки памяти.

Используем `AsyncPipe`

```ts
@Component({
  selector: "app-phones",
  template: `
    <p>Модель: {{ phone | async }}</p>
    <button (click)="showPhones()">Посмотреть модели</button>
  `,
})
export class AppPhonesComponent {
  readonly phones = ["iPhone 7", "LG G 5", "Honor 9", "Idol S4", "Nexus 6P"];

  phone: Observable<string>;

  constructor() {
    this.showPhones();
  }

  showPhones() {
    this.phone = interval(500).pipe(map((i: number) => this.phones[i]));
  }
}
```

Здесь с периодичностью в `500` миллисекунд в шаблон компонента передается очередной элемент из массива phones.

![Результат работы AsyncPipe](/public/9_2-join-pipe.png)

Компонент не должен подписываться на асинхронное получение данных, обрабатывать их, а при уничтожении отписываться от получения данных. Всю эту работу делает `AsyncPipe`.

Поскольку `AsyncPipe` позволяет легко извлекать данные из результата асинхронных операций, то его очень удобно применять, например, при загрузке данных из сети.

## Домашнее задание

Вам дан следующий интерфейс:

```ts
interface User {
  firstName: string;
  lastName: string;
  middleName: string;
  birthday: Date;
}

// пример заполнения
const user: User = {
  firstName: "Всеволод",
  lastName: "Золотов",
  middleName: "Дмитриевич",
  birthday: new Date(2002, 8, 18),
};
```

Реализуйте свой `UserPipe`, который будет отображать данные пользователя в двух режимах (Полный и сокращенный).

Полный: `Золотов Всеволод Дмитриевич`
Сокращенный: `Золотов В.Д.`

Реализуйте отображение поля `birthday` пользователя в формате `Wednesday, September 18, 2002`

### Для учителей

```ts
@Pipe(
  name: "user",
)
class UserPipe implements PipeTransform {
  transform(user: User, mode: 'short' | 'full' = 'full'): string {
    if (mode === 'full') {
      return `${user.lastName} ${user.firstName} ${user.middleName}`;
    }

    return `${user.lastName} ${user.firstName[0]}.${user.middleName[0]}.`
  }
}

@Component({
  selector: "app-user",
  template: `
    <div>
      <p>Short: {{ user | user : "short" }}</p>
      <p>Full: {{ user | user }}</p>
      <p>Birthday: {{ user.birthday | date : "EEEE, MMMM d, y" }}</p>
      <!-- или можно короче -->
      <p>Birthday: {{ user.birthday | date : "fullDate" }}</p>
    </div>
  `,
  providers: [UsersService],
})
class UsersComponent {
  readonly user: User = {
    firstName: "Всеволод",
    lastName: "Золотов",
    middleName: "Дмитриевич",
    birthday: new Date(2002, 8, 18),
  };
}
```
