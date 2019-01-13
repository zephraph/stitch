import React from "react"
import { serverRenderer } from "../serverRenderer"
import { uniq } from "lodash"

const modules = {
  Foo: () => <div>foo</div>,
  Bar: () => <div>bar</div>,
  Baz: ({ name }) => <div>{name}</div>,
}

describe("serverRenderer", () => {
  it("returns mapped components", () => {
    const { components } = serverRenderer({
      modules,
    })

    expect(Object.keys(components)).toEqual(["Foo", "Bar", "Baz"])
  })

  it("renders component html", () => {
    const { components } = serverRenderer({
      modules,
    })

    expect(components.Foo()).toContain("foo")
    expect(components.Bar()).toContain("bar")
    expect(components.Baz({ name: "baz" })).toContain("baz")
  })

  it("injects DOM id mount points", () => {
    const { components } = serverRenderer({
      modules,
    })

    expect(components.Foo()).toContain('id="stitch-component-')
  })

  it("injects custom DOM id mount points", () => {
    const { components } = serverRenderer({
      modules,
    })

    expect(
      components.Foo({
        mountId: "myCustomMountId",
      })
    ).toContain('id="myCustomMountId"')
  })

  it("creates unique id for each render", () => {
    const { components } = serverRenderer({
      modules,
    })

    const [foo] = components.Foo().match(/stitch-component-\d/)
    const [bar] = components.Bar().match(/stitch-component-\d/)
    const [baz] = components.Baz().match(/stitch-component-\d/)

    expect(uniq([foo, bar, baz]).length).toEqual(3)
  })

  it("wraps components in a custom wrapper", () => {
    const { components } = serverRenderer({
      modules,
      wrapper: ({ children }) => (
        <div id="foundWrappedComponent">{children}</div>
      ),
    })
    expect(components.Foo()).toContain("foundWrappedComponent")
  })

  it("serializes itself to be passed to the client", () => {
    const renderQueue = []

    const { components } = serverRenderer({
      modules,
      serialize: component => {
        renderQueue.push(component)
      },
    })

    components.Foo({ name: "Foo" })
    components.Bar({ name: "Bar" })
    components.Baz({ name: "Baz" })

    renderQueue.forEach(({ mountId, moduleName, props }) => {
      expect(mountId).toMatch(/stitch-component-\d/)
      expect(moduleName).toEqual(props.name)
    })
  })
})
