# Cервисы

Помимо компонентов, в Angular так же есть сервисы для повышения модульности и возможности повторного использования. Сервис — это класс с узкой, четко определенной целью. Он должен делать что-то конкретное и делать это хорошо.

## Почему сервисы?

Angular сервис — это обычный класс, используемый в контексте Angular для хранения глобального состояния приложения или в качестве поставщика данных.
Основная задача компонента заключается в отображении данных, в идеале, в компоненте должна быть только логика, отвечающая за отображение данных. Компонент - это посредник между представлением и логикой приложения.

Компоненты не должны получать или сохранять данные напрямую и уж точно не должны представлять заведомо ложные данные. Они должны сосредоточиться на представлении данных и делегировать доступ к ним сервису.

Сервисы хороши для таких задач, как получение данных с сервера, хранение и обработка данных, логирования. Зачастую, сервисы — это отличный способ обмена информацией между классами, которые не знают друг друга. Благордаря [DI](6-di.md) вы можете очень гибко предоставлять сервисы для компонентов.

## Примеры создания сервисов

Пример создания сервиса для хранения данных.

```ts
@Injectable({ providedIn: "root" })
export class FilterStateService {
  private filterState: Filter = {
    name: "",
    ageRange: {
      from: 18,
      to: 54,
    },
    hasEducation: false,
  };

  getFilter(): Filter {
    return this.filterState;
  }

  setFilter(filter: Filter): Filter {
    this.filterState = state;
  }
}
```

Пример создания сервиса для выполнения запросов на сервер.

```ts
@Injectable({ providedIn: "root" })
export class UsersHttpService {
  constructor(private readonly http: HttpClient) {}

  getUsers(): Observable {
    return this.http.get("/api/users");
  }
}
```

### Как Angular упрощает создание сервисов

Angular имеет очень мощное CLI, которое значительно ускоряет разработку. Чтобы быстро создать сервис выполните следующую команду.

```sh
ng generate service название-вашего-сервиса
```

## Опеределение сервисов в приложении

Angular сервисы могут быть определены на уровне приложения, модуля или компонента, для того, чтобы ограничить доступность сервиса для остальных сущностей приложения (компоненты, директивы и т.д.). Вы должны зарегистрировать по крайней мере одного провайдера сервиса, перед тем как его использовать. Поле `providedIn` в декораторе `@Injectable` позволяет управлять доступностью сервиса в других местах приложения. Например `providedIn: 'root'` сделает сервис доступным для всего приложения. К тому же, вы можете зарегистрировать сервисы в определенных модулях или компонентах, благодаря полю `providers` в декораторах `@NgModule` и `@Component`.

### Уровень приложения

Когда вы предоставляете сервис на корневом уровне, Angular создает единственный, общий экземпляр и внедряет его в любой класс, который его запрашивает. Регистрация провайдера в метаданных `@Injectable` также позволяет Angular оптимизировать приложение, удаляя сервис из скомпилированного приложения, если он не используется, процесс, известный как `tree-shaking`.

```ts
@Injectable({providedIn: 'root'})
```

### Уровень модуля

```ts
@NgModule({
  providers: [UsersHttpService],
})
```

### Уровень компонента

```ts
@Component({
  selector: 'app-users-list',
  providers: [UsersHttpService],
  template: `<div>Users list</div>`
})
```

## Использование сервисов

Мы научились предоставлять сервисы, а теперь давайте разберемся с использованием.

Сначала сервис необходимо импортировать, а далее должны задействовать встроенный в Angular механизм DI (подробнее в [уроке](/ссылка/на/урок/про/DI)) и получить объект сервиса в конструкторе компонента. После этого мы можем использовать его по необходимости.

```ts
import { UsersService, User } from "./users.service";

@Component({
  selector: "app-users-list",
  template: `
    <div *ngFor="let user of users">
      <p>Name: {{ user.name }}</p>
      <p>Age: {{ user.age }}</p>
    </div>
  `,
})
class UsersListComponent {
  readonly users: User[];

  constructor(private usersService: UsersService) {
    this.users = usersService.getUsers();
  }
}
```

Стоит отметить, что сервисы могут использовать другие сервисы, так же, как и компоненты. Это зачастую полезно, для композиции логики в одном месте. В данном примере объединяются данные о пользователях и постах, чтобы компонент, который будет использовать `UserPostsService`, занимался только отображением данных.

```ts
import { UsersService, User } from "./users.service";
import { PostsService, Post } from "./posts.service";

interface UserPost {
  id: string;
  authorName: string;
  text: string;
  date: Date;
}

@Injectable()
class UserPostsService {
  readonly userPosts: UserPost[];

  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService
  ) {}

  getUserPosts(): UserPost[] {
    const posts = this.postsService.getPosts();

    return posts.map((post) => {
      const author = this.usersService.getUserById(post.authorId);

      return {
        id: post.id,
        authorName: author.name,
        text: post.text,
        date: post.date,
      };
    });
  }
}
```

## Домашнее задание

Вам необходимо отображать пользователей по запросу `GET https://jsonplaceholder.typicode.com/users`
Для этого сделайте связку из двух сервисов и одного компонента.
Первый сервис `UsersRequestsService` должен заниматься только запросом данных. Подсказка: для выполнения запроса используйте `HttpClient`.
Второй сервис `UsersService` должен предоставлять только данные которые нужны компоненту.
Компонент `UsersComponent` должен отображать список пользователей.

Шаблон отображения пользователя должен быть таким.

```html
<div>
  <p>Name: {{ 'Имя пользователя' }}</p>
  <p>Email: {{ 'Email пользователя' }}</p>
  <p>Phone: {{ 'Phone пользователя' }}</p>
  <p>Address: {{ 'Город пользователя' }}, {{ 'Улица пользователя' }}</p>
</div>
```

### Для учителей

```ts
interface UserApi {
  id: number;
  name: string;
  email: string;
  address: {
    street: string;
    city: string;
  };
  phone: string;
}

@Injectable({ providedIn: "root" })
class UsersRequestsService {
  constructor(private readonly httpClient: HttpClient) {}

  getUsers(): Observable<UserApi[]> {
    return this.httpClient.get(`https://jsonplaceholder.typicode.com/users`);
  }
}

interface User {
  name: string;
  email: string;
  phone: string;
  city: string;
  street: string;
}

@Injectable()
class UsersService {
  constructor(private readonly usersRequestsService: UsersRequestsService) {}

  getUsers(): Observable<User[]> {
    return this.usersRequestsService.getUsers().pipe(
      map((users) =>
        users.map((user) => ({
          name: user.name,
          email: user.email,
          phone: user.phone,
          city: user.address.city,
          street: user.address.street,
        }))
      )
    );
  }
}

@Component({
  selector: "app-users",
  template: `
    <div *ngFor="let user of users | async">
      <p>Name: {{ user.name }}</p>
      <p>Email: {{ user.email }}</p>
      <p>Phone: {{ user.phone }}</p>
      <p>Address: {{ user.city }}, {{ user.street }}</p>
    </div>
  `,
  providers: [UsersService],
})
class UsersComponent {
  readonly users: Observable<User[]>;

  constructor(usersService: UsersService) {
    this.users = usersService.getUsers();
  }
}
```
