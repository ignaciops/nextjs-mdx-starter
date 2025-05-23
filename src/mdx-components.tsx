import { ComponentPropsWithoutRef } from 'react'
import type { MDXComponents } from 'mdx/types'
import BaseLink from '@/components/base/Link'
import type { Route } from 'next'
import BaseImage from '@/components/base/Image'
import type { ImageProps } from 'next/image'
import TocHighlight from './components/toc/Highlight'

// This file allows you to provide custom React components
// to be used in MDX files. You can import and use any
// React component you want, including components from
// other libraries.
 
type ListPropsType = ComponentPropsWithoutRef<'ul'>
type AnchorPropsType = ComponentPropsWithoutRef<'a'>

// This file is required to use MDX in `app` directory.
export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        // Allows customizing built-in components, e.g. to add styling.
        // h1: ({ children }) => <h1 style={{ fontSize: "100px" }}>{children}</h1>,
        ul: ({ children, ...props }: ListPropsType) => (
            <ul className="listContainer" {...props}>
                {children}
            </ul>
        ),
        a: ({ children, href, ...props }: AnchorPropsType) => (
            <BaseLink href={href as Route} {...props}>
                {children}
            </BaseLink>
        ),
        img: (props) => (<BaseImage {...props as ImageProps} />),
        aside: ({ children, ...props }) => {
            const tocHighlightProps = {
                headingsToObserve: 'h1, h2, h3',
                rootMargin: '-5% 0px -50% 0px',
                threshold: 1,
                ...props
            }
            return (
                <>
                    {props.id === 'articleToc' ? (
                        <TocHighlight {...tocHighlightProps}>
                            {children}
                        </TocHighlight>
                    ) : (
                        <aside {...props}>
                            {children}
                        </aside>
                    )}
                </>
            )
        },
        ...components,
    }
}