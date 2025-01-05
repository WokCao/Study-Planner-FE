import { ResponsivePie } from "@nivo/pie";

interface IPriorityChart {
    id: string;
    label: string;
    value: number;
    color: string;
}

interface IPieChart {
    data: IPriorityChart[]
}

function PieChart({ data }: IPieChart) {
    return (
        <ResponsivePie
            data={data}
            margin={{ top: 40, right: 60, bottom: 0, left: 60 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            colors={({ data }) => data.color}
            activeOuterRadiusOffset={8}
            borderWidth={1}
            borderColor={{
                from: 'color',
                modifiers: [
                    [
                        'darker',
                        0.2
                    ]
                ]
            }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#333333"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: 'color' }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={{
                from: 'color',
                modifiers: [
                    [
                        'darker',
                        2
                    ]
                ]
            }}
            legends={[
                {
                    anchor: 'bottom',
                    direction: 'row',
                    justify: false,
                    translateX: 0,
                    translateY: 56,
                    itemsSpacing: 0,
                    itemWidth: 80,
                    itemHeight: 18,
                    itemTextColor: '#999',
                    itemDirection: 'left-to-right',
                    itemOpacity: 1,
                    symbolSize: 10,
                    symbolShape: 'circle',
                    effects: [
                        {
                            on: 'hover',
                            style: {
                                itemTextColor: '#000'
                            }
                        }
                    ]
                }
            ]}
        />
    )
}

export default PieChart;