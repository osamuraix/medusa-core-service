# Custom subscribers

description: 'Learn how to create a subscriber in Medusa. You can use subscribers to implement functionalities like sending an order confirmation email.'
addHowToData: true

## Implementation

A subscriber is a TypeScript or JavaScript file that is created under `src/subscribers`. It can be created under subdirectories of `src/subscribers` as well. For example, you can place all subscribers to product events under the `src/subscribers/products` directory.

The subscriber file exports a default handler function, and the subscriber's configurations.

For example:

```ts title=src/subscribers/product-update-handler.ts
import { 
  ProductService,
  type SubscriberConfig, 
  type SubscriberArgs, 
} from "@medusajs/medusa"

export default async function productUpdateHandler({ 
  data, eventName, container, pluginOptions, 
}: SubscriberArgs<Record<string, any>>) {
  const productService: ProductService = container.resolve(
    "productService"
  )

  const { id } = data

  const product = await productService.retrieve(id)

  // do something with the product...
}

export const config: SubscriberConfig = {
  event: ProductService.Events.UPDATED,
  context: {
    subscriberId: "product-update-handler",
  },
}
```

### Subscriber Configuration

The exported configuration object of type `SubscriberConfig` must include the following properties:

- `event`: A string or an array of strings, each being the name of the event that the subscriber handler function listens to.
- `context`: An object that defines the context of the subscriber. It can accept any properties along with the `subscriberId` property. Learn more about the subscriber ID and the context object in [this section](#context-with-subscriber-id).

### Subscriber Handler Function

The default-export of the subscriber file is a handler function that is executed when the events specified in the exported configuration is triggerd.

The function accepts a parameter of type `SubscriberArgs`, which has the following properties:

- `data`: The data payload of the emitted event. Its type is different for each event. So, make sure to check the events reference for the expected payload of the events your subscriber listens to. You can then pass the expected payload type as a type parameter to `SubscriberArgs`, for example, `Record<string, string>`.
- `eventName`: A string indicating the name of the event. This is useful if your subscriber listens to more than one event and you want to differentiate between them.
- `container`: The dependency container that allows you to resolve Medusa resources, such as services.
- `pluginOptions`: When the subscriber is created within a plugin, this object holds the plugin's options defined in the Medusa configurations.

---

## Context with Subscriber ID

The `context` property of the subscriber configuration object is passed to the `eventBusService`. You can pass the `subscriberId` and any custom data in it.

:::note

The subscriber ID is useful when there is more than one handler function attached to a single event or if you have multiple Medusa backends running. This allows the events bus service to differentiate between handler functions when retrying a failed one, avoiding retrying all subscribers which can lead to data inconsistencies or general unwanted behavior in your system.

:::

### Inferred Subscriber ID

If you don't pass a subscriber ID to the subscriber configurations, the name of the subscriber function is used as the subscriber ID. If the subscriber function is an anonymous function, the name of the subscriber file is used instead.

---

## Caveats for Local Event Bus

If you use the `event-bus-local` as your event bus sevice, note the following:

- The `subscriberId` passed in the context is overwritten to a random ID when using `event-bus-local`. So, setting the subscriber ID in the context won't have any effect in this case.
- The `eventName` passed to the handler function will be `undefined` when using `event-bus-local` as it doesn't pass the event name properly.

:::note

While the local event bus is a good option for development, it's highly recommended to use the Redis Event Module in production.

:::

---

## Method 1: Using a Subscriber

Create the file `src/subscribers/customer-confirmation.ts` with the following content:

```ts title=src/subscribers/customer-confirmation.ts
import { 
  type SubscriberConfig, 
  type SubscriberArgs,
  CustomerService,
} from "@medusajs/medusa"

export default async function handleCustomerCreated({ 
  data, eventName, container, pluginOptions, 
}: SubscriberArgs<Record<string, string>>) {
  // TODO: handle event
}

export const config: SubscriberConfig = {
  event: CustomerService.Events.CREATED,
  context: {
    subscriberId: "customer-created-handler",
  },
}
```

In this file, you export a configuration object indicating that the subscriber is listening to the `CustomerService.Events.CREATED` (or `customer.created`) event.

You also export a handler function `handleCustomerConfirmation`. In the parameter it receives, the `data` object is the payload emitted when the event was triggered, which is the entire customer object. So, you can find in it fields like `first_name`, `last_name`, `email`, and more.

In this method, you should typically send an email to the customer. You can place any content in the email, such as welcoming them to your store or thanking them for registering.

### Example: Using SendGrid

For example, you can implement this subscriber to send emails using [SendGrid]:

```ts title=src/subscribers/customer-confirmation.ts
import { 
  type SubscriberConfig, 
  type SubscriberArgs,
  CustomerService,
} from "@medusajs/medusa"

export default async function handleCustomerCreated({ 
  data, eventName, container, pluginOptions, 
}: SubscriberArgs<Record<string, string>>) {
  const sendGridService = container.resolve("sendgridService")

  sendGridService.sendEmail({
    templateId: "customer-confirmation",
    from: "hello@medusajs.com",
    to: data.email,
    dynamic_template_data: {
      // any data necessary for your template...
      first_name: data.first_name,
      last_name: data.last_name,
    },
  })
}

export const config: SubscriberConfig = {
  event: CustomerService.Events.CREATED,
  context: {
    subscriberId: "customer-created-handler",
  },
}
```

Notice that you should replace the values in the object passed to the `sendEmail` method:

- `templateId`: Should be the ID of your confirmation email template in SendGrid.
- `from`: Should be the from email.
- `to`: Should be the customer’s email.
- `data`: Should be an object holding any data that should be passed to your SendGrid email template.

---

## Method 2: Using the NotificationService

If the notification provider you’re using already implements the logic to handle this event, you can create a [Loader] to subscribe the Notification provider to the `customer.created` event.

For example:

```ts title=src/loaders/customer-confirmation.ts
import { 
  MedusaContainer, 
  NotificationService,
} from "@medusajs/medusa"

export default async (
  container: MedusaContainer
): Promise<void> => {
  const notificationService = container.resolve<
    NotificationService
  >("notificationService")

  notificationService.subscribe(
    "customer.created", 
    "<NOTIFICATION_PROVIDER_IDENTIFIER>"
  )
}
```

Where `<NOTIFICATION_PROVIDER_IDENTIFIER>` is the identifier for your notification provider. For example, `sendgrid`.

---