---
id: list-search
title: List Search
---

import basicList from '@site/static/img/guides-and-concepts/list-search/basic-list.png';
import formList from '@site/static/img/guides-and-concepts/list-search/form-list.png';

We will examine how to make an extensive search and filtering with the [`useSimpleList`](../../api-references/hooks/show/useSimpleList.md) hook that works with the [`<List>`](https://ant.design/components/list) component.

To do this, let's list posts using the posts resource.

```tsx title="pages/posts/list.tsx"
import {
    List,
    AntdList,
    Space,
    NumberField,
    useSimpleList,
    useMany,
} from "@pankod/refine";

const { Text } = Typography;

//highlight-next-line
import { IPost, ICategory } from "interfaces";

export const PostList: React.FC = () => {
    //highlight-next-line
    const { listProps } = useSimpleList<IPost>();

    const categoryIds =
        listProps?.dataSource?.map((item) => item.category.id) ?? [];
    const { data } = useMany<ICategory>("categories", categoryIds, {
        enabled: categoryIds.length > 0,
    });

    const renderItem = (item: IPost) => {
        const { title, hit, content } = item;

        const categoryTitle = data?.data.find(
            (category: ICategory) => category.id === item.category.id,
        )?.title;

        return (
            <AntdList.Item
                actions={[
                    <Space key={item.id} direction="vertical" align="end">
                        <NumberField
                            value={hit}
                            options={{
                                notation: "compact",
                            }}
                        />
                        <Text>{categoryTitle}</Text>
                    </Space>,
                ]}
            >
                <AntdList.Item.Meta title={title} description={content} />
            </AntdList.Item>
        );
    };

    return (
        <List>
            //highlight-next-line
            <AntdList {...listProps} renderItem={renderItem} />
        </List>
    );
};
```

```ts title="interfaces/index.d.ts"
export interface ICategory {
    id: string;
    title: string;
}

export interface IPost {
    id: string;
    title: string;
    content: string;
    hit: number;
    category: ICategory;
}
```

Let's pass the list page we created to our `<Resource>` component.

```tsx
import { Refine, Resource } from "@pankod/refine";
import dataProvider from "@pankod/refine-simple-rest";
import "@pankod/refine/dist/styles.min.css";

//highlight-next-line
import { PostList } from "pages/posts";

const API_URL = "https://api.fake-rest.refine.dev";

const App: React.FC = () => {
    return (
        <Refine dataProvider={dataProvider(API_URL)}>
            //highlight-next-line
            <Resource name="posts" list={PostList} />
        </Refine>
    );
};

export default App;
```

<div style={{textAlign: "center"}}>
    <img src={basicList} />
</div>

<br />

We will create a form by extracting `searchFormProps` from [`useSimpleList`](../../api-references/hooks/show/useSimpleList.md). We will use this form for search/filtering. We will also create an interface to determine the types of values from the form.

```tsx title="pages/posts/list.tsx"
// ...

//highlight-next-line
import { IPostFilterVariables } from "interfaces";

export const PostList: React.FC = () => {
    //highlight-start
    const { listProps, searchFormProps } = useSimpleList<
        IPost,
        IPostFilterVariables
    >({
        onSearch: (params) => {
            const filters: CrudFilters = [];
            const { category, createdAt } = params;

            if (category) {
                filters.push({
                    field: "category.id",
                    operator: "eq",
                    value: category,
                });
            }

            if (createdAt) {
                filters.push(
                    {
                        field: "createdAt",
                        operator: "gte",
                        value: createdAt[0].toISOString(),
                    },
                    {
                        field: "createdAt",
                        operator: "lte",
                        value: createdAt[1].toISOString(),
                    },
                );
            }

            return filters;
        },
    });
    //highlight-end

    // ...

    //highlight-start
    const { selectProps: categorySelectProps } = useSelect<ICategory>({
        resource: "categories",
    });
    //highlight-end

    return (
        <List>
            //highlight-start
            <Form
                {...searchFormProps}
                layout="vertical"
                onValuesChange={() => searchFormProps.form?.submit()}
            >
                <Space wrap>
                    <Form.Item label="Category" name="category">
                        <Select
                            {...categorySelectProps}
                            allowClear
                            placeholder="Search Categories"
                        />
                    </Form.Item>
                    <Form.Item label="Created At" name="createdAt">
                        <RangePicker />
                    </Form.Item>
                </Space>
            </Form>
            //highlight-end
            <AntdList {...listProps} renderItem={renderItem} />
        </List>
    );
};
```

```ts title="interfaces/index.d.ts"
// ...

export interface IPostFilterVariables {
    category: string;
    createdAt: [Dayjs, Dayjs];
}
```

When the form is submitted, the `onSearch` method runs and we get the search form values. Then the `listProps` is refreshed according to the criteria.



<div style={{textAlign: "center"}}>
    <img src={formList} />
</div>

<br />

:::important
[`CrudFilters`](../../api-references/interfaces.md#crudfilters) type object has `field`, `operator` and `value` properties. These properties help us to filter in which field, with which operator, and with which data.
:::

## Live Codesandbox Example

<iframe src="https://codesandbox.io/embed/refine-use-simple-list-example-vcq4d?autoresize=1&fontsize=14&module=%2Fsrc%2Fpages%2Fposts%2Flist.tsx&theme=dark&view=preview"
    style={{width: "100%", height:"80vh", border: "0px", borderRadius: "8px", overflow:"hidden"}}
    title="refine-use-simple-list-example"
    allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
    sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>