# Implementação do Padrão Criteria para NestJS com TypeORM
========================================================

Este repositório contém uma implementação robusta e desacoplada do **Padrão de Projeto Criteria**. O objetivo é fornecer uma maneira limpa, reutilizável e escalável para construir consultas dinâmicas e complexas ao banco de dados, separando a lógica de filtragem da camada de aplicação.

O que é o Padrão Criteria?
--------------------------

O Padrão Criteria é uma abordagem que utiliza objetos para construir programaticamente as condições de uma consulta. Em vez de concatenar strings SQL ou usar condicionais (if/else) para montar queries, você cria um objeto Criteria que encapsula todas as regras (filtros, ordenação, paginação).

Este objeto é então traduzido por um "conversor" para a linguagem específica do seu ORM (neste caso, o QueryBuilder do TypeORM).

### Vantagens

*   **Desacoplamento**: Seus serviços e controllers não precisam saber como o TypeORM funciona. Eles apenas montam um objeto Criteria.
    
*   **Reutilização**: A lógica de conversão é centralizada e pode ser usada por qualquer repositório.
    
*   **Código Limpo**: Elimina a necessidade de if/else aninhados nos repositórios para construir queries dinâmicas.
    
*   **Testabilidade**: A lógica de negócio para criar filtros pode ser testada de forma isolada.
    
*   **Flexibilidade**: Adicionar novos operadores de filtro é simples e centralizado no conversor.
    

Estrutura do Projeto
--------------------

A arquitetura foi organizada para separar claramente as responsabilidades, com um core contendo a lógica compartilhada e módulos de funcionalidades como example.

```
src/  
├── core/  
│   ├── criteria/  
│   │   ├── data-access/ # Conversores e adaptadores  
│   │   ├── feature/     # Módulo NestJS do Criteria  
│   │   └── util/  
│   │       ├── enums/   # Enums (FilterOperator, etc.)  
│   │       └── types/   # Classes de domínio (Criteria, Filter)  
│   │  
│   └── database/  
│       ├── entities/  
│       │   ├── base.entity.ts   # Entidade base com 'id'  
│       │   └── example.entity.ts   # Entidade de exemplo  
│       │  
│       └── repositories/  
│           └── base.repository.ts  # Repositório base genérico  
│  
└── example/
    ├── data-access/      
    │   └── repositories/      
    │       └── example.repository.ts # Repositório da entidade Example      
    │      
    └── feature/          
    └── example.controller.ts  # Controller da entidade Example
```

Como Utilizar
-------------

### 1\. Importe o CriteriaModule

O CriteriaModule deve ser @Global() ou importado no seu AppModule principal para que o TypeOrmCriteriaConverter esteja disponível para injeção em toda a aplicação.

```
// Em algum lugar como src/core/criteria/feature/criteria.module.ts  
// E então importado no AppModule principal
```

### 2\. Crie suas Entidades e o BaseRepository

Sua entidade base conteria campos comuns como o id.

```
// src/core/database/entities/base.entity.ts  
export abstract class BaseEntity {    
    id: string; // Ou number, uuid, etc.  
}  

// src/core/database/entities/example.entity.ts  
import { BaseEntity } from './base.entity';  
export class ExampleEntity extends BaseEntity {    
    name: string;  
}
```

O BaseRepository centraliza a lógica do Criteria.

```
// src/core/database/repositories/base.repository.ts  
// ... lógica do BaseRepository que usa o TypeOrmCriteriaConverter
```

### 3\. Crie o Repositório da sua Entidade

Estenda o BaseRepository para herdar automaticamente os métodos findByCriteria e countByCriteria.

```
// src/example/data-access/repositories/example.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExampleEntity } from '../../../core/database/entities/example.entity';
import { TypeOrmCriteriaConverter } from '../../../core/criteria/data-access/typeorm-criteria-converter';
import { BaseRepository } from '../../../core/database/repositories/base.repository';

@Injectable()
export class ExampleRepository extends BaseRepository {
    constructor(@InjectRepository(ExampleEntity)
                private readonly exampleEntityRepository: Repository,      
                private readonly typeOrmCriteriaConverter: TypeOrmCriteriaConverter,
    ) {
        // Passa as dependências para a classe pai
        super(exampleEntityRepository, typeOrmCriteriaConverter);
    }

    // Métodos específicos do ExampleRepository podem ser adicionados aqui.
}
```

### 4\. Construa o Objeto Criteria no seu Controller

No controller, extraia os parâmetros da requisição (@Query) e use-os para construir o objeto Criteria.

**Exemplo Prático (example.controller.ts):**

```
// src/example/feature/example.controller.ts
import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
// ... imports do Criteria, Filter, Order, etc.

@Controller('examples')
export class ExampleController {
    constructor(private readonly exampleService: ExampleService) {}

    @Get()
    async search(
    @Query('name') name?: string,
    @Query('orderBy', new DefaultValuePipe('name')) orderBy?: string,
    @Query('orderDirection', new DefaultValuePipe('ASC')) orderDirection?: OrderDirection,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
    ) {
        const filters: Filter[] = [];
        if (name) {
        filters.push(new Filter('name', FilterOperator.CONTAINS, name));
        }
        const order = new Order(orderBy, orderDirection);
        const criteria = new Criteria(filters, order, limit, offset);
        // O serviço irá chamar o repositório, que aplicará o criteria.
        return this.exampleService.search(criteria);
    }
}
```

Este endpoint agora é capaz de lidar com requisições como:

`/examples?name=teste&orderBy=name&orderDirection=DESC&limit=20`

E a lógica no repositório permanece simples e limpa, graças ao Criteria Pattern.
