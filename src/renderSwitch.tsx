import React, { ComponentClass } from "react"
import ReactDOM from "react-dom/server"
import { StitchConfig, StitchOptions } from "./index"
import { Block } from "./render"
import { renderTemplate } from "./renderTemplate"
import { isComponent, isTemplate } from "./utils"

type RenderSwitchOptions = Pick<
  StitchOptions,
  "basePath" | "config" | "data" | "locals" | "templates"
>

export async function renderSwitch(
  block: Block,
  options: RenderSwitchOptions
): Promise<{ html: string }> {
  let html = ""

  if (!block) {
    return { html }
  }

  const {
    basePath = process.cwd(),
    data = {},
    locals = {},
    templates = {},
  } = options

  const config: StitchConfig = {
    componentRenderer: ReactDOM.renderToString,
    ...options.config,
  }

  if (isTemplate(block)) {
    html = await renderTemplate(block, {
      basePath,
      locals: {
        ...locals,
        ...data,
        ...templates,
      },
    })
  } else if (isComponent(block)) {
    const props = { ...data, locals, templates }
    const isReact = config.componentRenderer === ReactDOM.renderToString

    if (isReact) {
      const Component = block as ComponentClass<any>
      html = config.componentRenderer(<Component {...props} />)
    } else {
      html = config.componentRenderer((block as any)(props))
    }
  } else {
    if (process.env.NODE_ENV === "development") {
      throw new Error(
        "@artsy/stitch: (lib/index) " +
          "Error rendering layout: `block` must be a template, React " +
          "component or string"
      )
    }
  }

  return { html }
}
