# Custom models

You may define custom models (entities) that will be registered on the global container by creating files in the `src/models` directory that export an instance of `BaseEntity`.

## Step 1: Create the Entity

To create an entity, create a TypeScript file in `src/models`. For example, here’s a `Post` entity defined in the file `src/models/post.ts`:

:::note

Entities can only be placed in the top level of the `src/models` directory. So, you can't create an entity in a subfolder.

:::

```ts title=src/models/post.ts
import { 
  BeforeInsert, 
  Column, 
  Entity, 
  PrimaryColumn,
} from "typeorm"
import { BaseEntity } from "@medusajs/medusa"
import { generateEntityId } from "@medusajs/medusa/dist/utils"

@Entity()
export class Post extends BaseEntity {
  @Column({ type: "varchar" })
  title: string | null

  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "post")
  }
}
```

This entity has one column `title` defined. However, since it extends `BaseEntity` it will also have the `id`, `created_at`, and `updated_at` columns.

Medusa’s core entities all have the following format for IDs: `<PREFIX>_<RANDOM>`. For example, an order might have the ID `order_01G35WVGY4D1JCA4TPGVXPGCQM`.

To generate an ID for your entity that matches the IDs generated for Medusa’s core entities, you should add a `BeforeInsert` event handler. Then, inside that handler use Medusa’s utility function `generateEntityId` to generate the ID. It accepts the ID as a first parameter and the prefix as a second parameter. The `Post` entity IDs will be of the format `post_<RANDOM>`.

You can learn more about what decorators and column types you can use in [Typeorm’s documentation](https://typeorm.io/entities).

### Soft-Deletable Entities

If you want the entity to also be soft deletable then it should extend `SoftDeletableEntity` instead:

```ts
import { SoftDeletableEntity } from "@medusajs/medusa"

@Entity()
export class Post extends SoftDeletableEntity {
  // ...
}
```

### Adding Relations

Your entity may be related to another entity. You can showcase the relation with [Typeorm's relation decorators](https://typeorm.io/relations).

For example, you can create another entity `Author` and add a `ManyToOne` relation to it from the `Post`, and a `OneToMany` relation from the `Author` to the `Post`:

<Tabs groupId="files" isCodeTabs={true}>
  <TabItem value="post" label="src/models/post.ts" default>

    ```ts
    import { 
      BeforeInsert, 
      Column, 
      Entity,
      JoinColumn,
      ManyToOne, 
    } from "typeorm"
    import { BaseEntity } from "@medusajs/medusa"
    import { generateEntityId } from "@medusajs/medusa/dist/utils"
    import { Author } from "./author"

    @Entity()
    export class Post extends BaseEntity {
      @Column({ type: "varchar" })
      title: string | null

      @Column({ type: "varchar" })
      author_id: string

      @ManyToOne(() => Author, (author) => author.posts)
      @JoinColumn({ name: "author_id" })
      author: Author

      @BeforeInsert()
      private beforeInsert(): void {
        this.id = generateEntityId(this.id, "post")
      }
    }
    ```

  </TabItem>
  <TabItem value="author" label="src/models/author.ts">

    ```ts
    import { BaseEntity, generateEntityId } from "@medusajs/medusa"
    import { 
      BeforeInsert,
      Column,
      Entity,
      OneToMany,
    } from "typeorm"
    import { Post } from "./post"

    @Entity()
    export class Author extends BaseEntity {
      @Column({ type: "varchar" })
      name: string

      @Column({ type: "varchar", nullable: true })
      image?: string

      @OneToMany(() => Post, (post) => post.author)
      posts: Post[]

      @BeforeInsert()
      private beforeInsert(): void {
        this.id = generateEntityId(this.id, "auth")
      }
    }
    ```

  </TabItem>
</Tabs>

Adding these relations allows you to later on expand these relations when retrieving records of this entity with repositories.

### 2. Create the Migration

You also need to create a Migration to create the new table in the database. See [How to Create Migrations](https://docs.medusajs.com/advanced/backend/migrations/) in the documentation.

With this option, you'll use Typeorm's CLI tool to create the migration file, but you'll write the content yourself.

Run the following command in the root directory of your Medusa backend project:

```bash
npx typeorm migration:create src/migrations/AddAuthorsAndPosts
```

For example:

<!-- eslint-disable max-len -->

```ts
import { MigrationInterface, QueryRunner } from "typeorm"

export class AddAuthorsAndPosts1690876698954 implements MigrationInterface {
  name = "AddAuthorsAndPosts1690876698954"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "post" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "title" character varying NOT NULL, "author_id" character varying NOT NULL, "authorId" character varying, CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`)
    await queryRunner.query(`CREATE TABLE "author" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "image" character varying, CONSTRAINT "PK_5a0e79799d372fe56f2f3fa6871" PRIMARY KEY ("id"))`)
    await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_c6fb082a3114f35d0cc27c518e0" FOREIGN KEY ("authorId") REFERENCES "author"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_c6fb082a3114f35d0cc27c518e0"`)
    await queryRunner.query(`DROP TABLE "author"`)
    await queryRunner.query(`DROP TABLE "post"`)
  }
}
```

:::warning

If you're copying the code snippet above, make sure to not copy the class name or the `name` attribute in it. Your migration should keep its timestamp.

:::

Then, after creating your entity, run the `build` command:

```bash npm2yarn
npm run build
```

The last step is to run the migration with the command detailed earlier

```bash
npx medusa migrations run
```

If you check your database now you should see that the change defined by the migration has been applied successfully.

See more about defining and accesing your custom [Entities](https://docs.medusajs.com/advanced/backend/entities/overview) in the documentation.