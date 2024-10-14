import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import plotly from 'plotly.js/dist/plotly';
import PlotlyEditor from 'react-chart-editor';
import 'react-chart-editor/lib/react-chart-editor.css';
import { Button, Modal, Select } from '@gravity-ui/uikit';
import './Dashboard.css';

interface GraphicData {
  data: any[];
  layout: any;
  frames?: any[];
}

const dataSources: { [key: string]: any } = {};

const dataSourceOptions = Object.keys(dataSources).map((name) => ({
  value: name,
  label: name,
}));

const config = { editable: true };

const MAX_WIDTH = 400;
const MAX_HEIGHT = 300;

const Dashboard: React.FC = () => {
  const [graphics, setGraphics] = useState<GraphicData[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [mocks, setMocks] = useState<any[]>([]);
  const [currentMockIndex, setCurrentMockIndex] = useState<number>(-1);
  const [tempGraphic, setTempGraphic] = useState<GraphicData | null>(null);

  useEffect(() => {
    fetch('https://api.github.com/repos/plotly/plotly.js/contents/test/image/mocks')
      .then((response) => response.json())
      .then((mocksData) => setMocks(mocksData));
  }, []);

  const addNewGraphic = () => {
    const newGraphic: GraphicData = {
      data: [{ x: [1, 2, 3], y: [2, 6, 3], type: 'scatter' }],
      layout: { width: MAX_WIDTH, height: MAX_HEIGHT, title: 'New Graphic' },
    };
    setGraphics([...graphics, newGraphic]);
  };

  const editGraphic = (index: number) => {
    setEditingIndex(index);
    setTempGraphic(JSON.parse(JSON.stringify(graphics[index])));
  };

  const deleteGraphic = (index: number) => {
    const updatedGraphics = graphics.filter((_, i) => i !== index);
    setGraphics(updatedGraphics);
  };

  const handleEditorUpdate = (data: any[], layout: any, frames: any[]) => {
    if (tempGraphic !== null) {
      const updatedLayout = {
        ...layout,
        width: Math.min(layout.width || MAX_WIDTH, MAX_WIDTH),
        height: Math.min(layout.height || MAX_HEIGHT, MAX_HEIGHT),
      };
      setTempGraphic({ data, layout: updatedLayout, frames });
    }
  };

  const saveGraphic = () => {
    if (editingIndex !== null && tempGraphic !== null) {
      const updatedGraphics = [...graphics];
      updatedGraphics[editingIndex] = tempGraphic;
      setGraphics(updatedGraphics);
      closeEditor();
    }
  };

  const closeEditor = () => {
    setEditingIndex(null);
    setTempGraphic(null);
    setCurrentMockIndex(-1);
  };

  const loadMock = (mockIndex: number) => {
    const mock = mocks[mockIndex];
    fetch(mock.url, {
      headers: new Headers({ Accept: 'application/vnd.github.v3.raw' }),
    })
      .then((response) => response.json())
      .then((figure) => {
        const updatedLayout = {
          ...figure.layout,
          width: Math.min(figure.layout.width || MAX_WIDTH, MAX_WIDTH),
          height: Math.min(figure.layout.height || MAX_HEIGHT, MAX_HEIGHT),
        };
        setTempGraphic({
          data: figure.data,
          layout: updatedLayout,
          frames: figure.frames,
        });
        setCurrentMockIndex(mockIndex);
      });
  };

  const downloadDashboardConfig = () => {
    const dashboardConfig = JSON.stringify(graphics, null, 2);
    const blob = new Blob([dashboardConfig], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dashboard_config.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4">
      <h3 className="text-2xl font-bold mb-4">Graphics Dashboard</h3>
      <div className="grid grid-cols-3 gap-4">
        {graphics.map((graphic, index) => (
          <div key={index} className="border border-gray-300 p-2">
            <Plot
              data={graphic.data}
              layout={{
                ...graphic.layout,
                width: Math.min(graphic.layout.width || MAX_WIDTH, MAX_WIDTH),
                height: Math.min(graphic.layout.height || MAX_HEIGHT, MAX_HEIGHT),
              }}
              config={config}
              frames={graphic.frames}
            />
            <div className="mt-2 flex justify-between">
              <Button
                view="action"
                size="m"
                onClick={() => editGraphic(index)}
              >
                Edit
              </Button>
              <Button
                view="danger"
                size="m"
                onClick={() => deleteGraphic(index)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
        {graphics.length < 9 && (
          <div className="border border-gray-300 p-2 flex items-center justify-center">
            <Button
              view="action"
              size="l"
              onClick={addNewGraphic}
            >
              Add New Graphic
            </Button>
          </div>
        )}
      </div>
      <Button
        view="normal"
        size="m"
        onClick={downloadDashboardConfig}
        className="mt-4"
      >
        Download Dashboard Config
      </Button>
      <Modal
        open={editingIndex !== null}
        onClose={closeEditor}
      >
        {editingIndex !== null && tempGraphic !== null && (
          <div className="p-4 w-90vw h-90vh flex flex-direction-column">
            <PlotlyEditor
              data={tempGraphic.data}
              layout={tempGraphic.layout}
              config={config}
              frames={tempGraphic.frames}
              dataSources={dataSources}
              dataSourceOptions={dataSourceOptions}
              plotly={plotly}
              onUpdate={(data, layout, frames) => handleEditorUpdate(data, layout, frames)}
              useResizeHandler
              debug
              advancedTraceTypeSelector
              className="flex-1 min-height-0"
            />
            <div className="mt-4 flex items-center">
              <span className="mr-2">Select mock:</span>
              <Select
                value={[String(currentMockIndex)]}
                onUpdate={(value: string[]) => loadMock(Number(value[0]))}
                options={[
                  { value: '-1', content: 'Select a mock' },
                  ...mocks.map((mock, index) => ({
                    value: String(index),
                    content: mock.name,
                  })),
                ]}
                className="flex-grow"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                view="action"
                size="m"
                onClick={saveGraphic}
                className="mr-2"
              >
                Save
              </Button>
              <Button
                view="normal"
                size="m"
                onClick={closeEditor}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
