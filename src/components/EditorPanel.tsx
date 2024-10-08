// Portions of this file are Copyright 2021 Google LLC, and licensed under GPL2+. See COPYING.

import React, {
  CSSProperties,
  useContext,
  useRef,
  useState
} from 'react'
import Editor, { loader, Monaco } from '@monaco-editor/react'
import openscadEditorOptions from '../language/openscad-editor-options'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { Button } from 'primereact/button'
import { MenuItem } from 'primereact/menuitem'
import { Menu } from 'primereact/menu'
import { buildUrlForStateParams } from '../state/fragment-state'
import {
  blankProjectState,
  defaultSourcePath
} from '../state/initial-state'
import { ModelContext, FSContext } from './contexts'


let monacoInstance: Monaco
loader.init().then(mi => (monacoInstance = mi))

export default function EditorPanel({
  className,
  style
}: {
  className?: string
  style?: CSSProperties
}) {
  const model = useContext(ModelContext)
  if (!model) throw new Error('No model')

  const menu = useRef<Menu>(null)
  const state = model.state
  // ---------------------------------

  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState(state.params.source)

  // ---------------------------------
  const [editor, setEditor] = useState(
    null as monaco.editor.IStandaloneCodeEditor | null
  )
  if (editor) {
    const checkerRun = state.lastCheckerRun
    const editorModel = editor.getModel()
    if (editorModel) {
      if (checkerRun) {
        monacoInstance.editor.setModelMarkers(
          editorModel,
          'openscad',
          checkerRun.markers
        )
      }
    }
  }

  const onMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editor.addAction({
      id: 'openscad-render',
      label: 'Render OpenSCAD',
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
        monaco.KeyCode.F6
      ],
      run: () => model.render({ isPreview: false, now: true })
    })
    editor.addAction({
      id: 'openscad-preview',
      label: 'Preview OpenSCAD',
      keybindings: [monaco.KeyCode.F5],
      run: () => model.render({ isPreview: true, now: true })
    })
    setEditor(editor)
  }

  return (
    <div
      className={`editor-panel ${className ?? ''}`}
      style={{
        // maxWidth: '5 0vw',
        display: 'flex',
        flexDirection: 'column',
        // position: 'relative',
        // width: '100%', height: '100%',
        ...(style ?? {})
      }}
    >
      <div
        className='flex flex-row gap-2'
        style={{
          margin: '5px'
        }}
      >
        <Menu
          model={
            [
              {
                label: 'New project',
                icon: 'pi pi-plus-circle',
                url: buildUrlForStateParams(blankProjectState),
                target: '_blank'
              },
              {
                // TODO: share text, title and rendering image
                // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
                label: 'Share project',
                icon: 'pi pi-share-alt',
                disabled: true
              },
              {
                separator: true
              },
              {
                // TODO: popup to ask for file name
                label: 'New file',
                icon: 'pi pi-plus',
                disabled: true
              },
              {
                label: 'Copy to new file',
                icon: 'pi pi-clone',
                disabled: true
              },
              {
                label: 'Upload file(s)',
                icon: 'pi pi-upload',
                disabled: true
              },
              {
                label: 'Download sources',
                icon: 'pi pi-download',
                disabled: true
              },
              {
                separator: true
              },
              // https://vscode-docs.readthedocs.io/en/stable/customization/keybindings/
              // {
              //   label: 'Undo',
              //   icon: 'pi pi-undo',
              //   // disabled: true,
              //   command: () => editor?.trigger(state.params.sourcePath, 'editor.action.undoAction', null),
              // },
              // {
              //   label: 'Redo',
              //   icon: 'pi pi-reply',
              //   // disabled: true,
              //   command: () => editor?.trigger(state.params.sourcePath, 'editor.action.redoAction', null),
              // },
              {
                separator: true
              },
              // {
              //   label: 'Copy',
              //   icon: 'pi pi-copy',
              //   // disabled: true,
              //   command: () => editor?.trigger(state.params.sourcePath, 'editor.action.clipboardCopyAction', null),
              // },
              // {
              //   label: 'Cut',
              //   icon: 'pi pi-eraser',
              //   // disabled: true,
              //   command: () => editor?.trigger(state.params.sourcePath, 'editor.action.clipboardCutAction', null),
              // },
              // {
              //   label: 'Paste',
              //   icon: 'pi pi-images',
              //   // disabled: true,
              //   command: () => editor?.trigger(state.params.sourcePath, 'editor.action.clipboardPasteAction', null),
              // },
              {
                label: 'Select All',
                icon: 'pi pi-info-circle',
                // disabled: true,
                command: () =>
                  editor?.trigger(
                    state.params.sourcePath,
                    'editor.action.selectAll',
                    null
                  )
              },
              {
                separator: true
              },
              {
                label: 'Find',
                icon: 'pi pi-search',
                // disabled: true,
                command: () =>
                  editor?.trigger(
                    state.params.sourcePath,
                    'actions.find',
                    null
                  )
              }
            ] as MenuItem[]
          }
          popup
          ref={menu}
        />
        <Button
          title='Editor menu'
          rounded
          text
          icon='pi pi-ellipsis-h'
          onClick={e => menu.current && menu.current.toggle(e)}
        />


        {state.params.sourcePath !== defaultSourcePath && (
          <Button
            icon='pi pi-chevron-left'
            text
            onClick={() => model.openFile(defaultSourcePath)}
            title={`Go back to ${defaultSourcePath}`}
          />
        )}
      </div>

      <div
        style={{
          position: 'relative',
          flex: 1
        }}
      >
        {loading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '100%',
              backgroundColor: 'rgb(0 ,0 ,0 ,0.5)',
              zIndex: 99,
              display: 'flex'
            }}
          >
            <h1
              style={{
                margin: 'auto',
                color: 'white',
                fontFamily: 'sans-serif'
              }}
            >
              Loading...
            </h1>
          </div>
        )}

        <Editor
          className='openscad-editor absolute-fill'
          defaultLanguage='openscad'
          path={state.params.sourcePath}
          value={code}
          onChange={s => (model.source = s ?? '')}
          onMount={onMount} // TODO: This looks a bit silly, does it trigger a re-render??
          options={{
            ...openscadEditorOptions,
            fontSize: 16,
            lineNumbers: state.view.lineNumbers ? 'on' : 'off'
            // readOnly: !isFileWritable(state.params.sourcePath)
          }}
        />
      </div>

      <div
        style={{
          display: state.view.logs ? undefined : 'none',
          overflowY: 'scroll',
          height: 'calc(min(200px, 30vh))'
        }}
      >
        <pre>
          <code id='logs' style={{}}>
            {state.lastCheckerRun?.logText ?? 'No log yet!'}
          </code>
        </pre>
      </div>
    </div>
  )
}
