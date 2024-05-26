const Item = ({instance})=>{
    return (
        <List.Item style={MyStyle.margin10} key={c.id} title={['Shop: ', c.name]} 
                    description={['Địa chỉ: ' + c.address + '\n' + 'Chủ Shop: ' + c.owner,]}
                        left={() => <Image style={MyStyle.img} source={{ uri: c.image }} />}
        />
    )
}