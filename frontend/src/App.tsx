import { useState } from 'react'
import logo from './assets/images/gethub_logo.svg'
import './App.css'
import {
  DefaultArchiveCompressionOption,
  ArchiveCompressionOptions,
  SelectDirectory,
  BackupRepositories,
} from '../wailsjs/go/main/App'
import LoadingScreen from './components/loading-screen'

function App() {
  const [loadingScreenState, setLoadingScreenState] = useState(false)
  const [resultText, setResultText] = useState('')
  const [selectedDirectory, setSelectedDirectory] = useState('')
  const [username, setUsername] = useState('')
  const [archiveCompressionOptions, setArchiveCompressionOptions] = useState<
    string[]
  >([])
  const [archiveCompressionOption, setArchiveCompressionOption] = useState('')

  const invertLoadingScreenState = () =>
    setLoadingScreenState((previousState) => !previousState)
  const updateUsername = (e: any) => setUsername(e.target.value)
  const updateResultText = (result: string) => setResultText(result)
  const updateSelectedDirectory = (result: string) =>
    setSelectedDirectory(result)
  const updateArchiveCompressionOptions = (items: string[]) =>
    setArchiveCompressionOptions(items)
  const updateArchiveCompressionOption = (e: any) =>
    setArchiveCompressionOption(e.target.value)

  function getDefaultArchiveCompressionOption() {
    DefaultArchiveCompressionOption().then(setArchiveCompressionOption)
  }

  function getArchiveCompressionOptions() {
    ArchiveCompressionOptions().then(updateArchiveCompressionOptions)
  }

  function selectDirectory() {
    SelectDirectory()
      .then(updateSelectedDirectory)
      .then(renderSelectedDirectory)
  }

  function backupRepositories() {
    invertLoadingScreenState()

    BackupRepositories(username, selectedDirectory, archiveCompressionOption)
      .then(updateResultText)
      .then(invertLoadingScreenState)
  }

  function renderSelectedDirectory() {
    if (selectedDirectory !== '') {
      return <p>{selectedDirectory}&lrm;</p>
    }
    return <p>No output folder selected.&lrm;</p>
  }

  getDefaultArchiveCompressionOption()

  return (
    <div id="App">
      <LoadingScreen isActive={loadingScreenState} />

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
        <select
          id="archiveAndCompressionMethod"
          className="input"
          onChange={(e) => setArchiveCompressionOption(e.target.value)}
        >
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
