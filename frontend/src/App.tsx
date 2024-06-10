import { useState } from 'react'
import logo from './assets/images/gethub_logo.svg'
import './App.css'
import {
  ArchiveCompressionOptions,
  SelectDirectory,
  BackupRepositories,
} from '../wailsjs/go/main/App'

function App() {
  const [resultText, setResultText] = useState('')
  const [selectedDirectory, setSelectedDirectory] = useState('')
  const [username, setUsername] = useState('')
  const [archiveCompressionOptions, setArchiveCompressionOptions] = useState<
    string[]
  >([])
  const updateUsername = (e: any) => setUsername(e.target.value)
  const updateResultText = (result: string) => setResultText(result)
  const updateSelectedDirectory = (result: string) =>
    setSelectedDirectory(result)
  const updateArchiveCompressionOptions = (items: string[]) =>
    setArchiveCompressionOptions(items)

  function getArchiveCompressionOptions() {
    ArchiveCompressionOptions().then(updateArchiveCompressionOptions)
  }

  function selectDirectory() {
    SelectDirectory()
      .then(updateSelectedDirectory)
      .then(renderSelectedDirectory)
  }

  function backupRepositories() {
    BackupRepositories(username, selectedDirectory).then(updateResultText)
  }

  function renderSelectedDirectory() {
    if (selectedDirectory !== '') {
      return <p>{selectedDirectory}&lrm;</p>
    }
    return <p>No output folder selected.&lrm;</p>
  }

  return (
    <div id="App">
      <img src={logo} id="logo" alt="logo" />
      <div id="result" className="result">
        {resultText}
      </div>
      <div id="input" className="input-box">
        <label htmlFor="username">Enter a GitHub username:</label>
        <br />
        <input
          id="username"
          className="input"
          onChange={updateUsername}
          autoComplete="off"
          name="input"
          type="text"
        />
        <br />
        <br />
        <label htmlFor="chooseOutputFolder">
          Choose a folder to store backup:
        </label>
        <br />
        <button
          id="chooseOutputFolder"
          className="btn"
          onClick={selectDirectory}
        >
          Choose Output Folder
        </button>
        <div id="selectedOutputDirectory">{renderSelectedDirectory()}</div>
        <br />
        <label htmlFor="archiveAndCompressionMethod">
          Choose an archive and compression method:
        </label>
        <br />
        <select id="archiveAndCompressionMethod" className="input">
          {
            (getArchiveCompressionOptions(),
            archiveCompressionOptions.map((item, index) => (
              <option value={item}>{item}</option>
            )))
          }
        </select>
        <br />
        <br />
        <button className="btn" onClick={backupRepositories}>
          Backup
        </button>
      </div>
    </div>
  )
}

export default App
